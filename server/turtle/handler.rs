use super::auth;
use super::context;
use super::graphql;
use super::message;

#[derive(Debug)]
pub struct HandleError {}

impl std::error::Error for HandleError {}
impl std::fmt::Display for HandleError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "Error handling request")
    }
}
impl From<jsonwebtoken::errors::Error> for HandleError {
    fn from(_: jsonwebtoken::errors::Error) -> Self {
        Self {}
    }
}
impl From<redis::RedisError> for HandleError {
    fn from(_: redis::RedisError) -> Self {
        Self {}
    }
}
impl From<serde_json::Error> for HandleError {
    fn from(_: serde_json::Error) -> Self {
        Self {}
    }
}
impl From<regex::Error> for HandleError {
    fn from(_: regex::Error) -> Self {
        Self {}
    }
}

mod jwt {
    use super::*;
    use auth::Token;
    async fn post(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), HandleError> {
        if let Some(refresh) = message.cookies.get("refresh") {
            /* Extract claims found in the cookie. */
            let claims = context.auth.refresh.verify(refresh.to_string())?;

            /* Extract claims from Redis */
            let mut json = context.redis.json().await?;
            let path = Some("$".to_string());
            let result = json.get(claims.sub.clone(), path, None).await?;
            let user = serde_json::from_str::<auth::Claims>(result.as_str())?;

            /* If the refresh token is valid, then create an access token. */
            if user.jti == claims.jti {
                context.auth.refresh.create(user.clone(), message)?;
                *message.response.status_mut() = hyper::StatusCode::OK;
                let access_token = context.auth.access.create(user, message)?;
                *message.response.body_mut() = hyper::Body::from(access_token);
            }
        }
        Ok(())
    }
    pub async fn handle(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), HandleError> {
        match *message.request.method() {
            hyper::Method::POST => post(message, context).await,
            _ => {
                *message.response.status_mut() =
                    hyper::StatusCode::METHOD_NOT_ALLOWED;
                *message.response.body_mut() = hyper::Body::empty();
                Ok(())
            }
        }
    }
}

mod gql {
    use super::*;
    async fn get(
        message: &mut message::Message,
        _context: context::Context,
    ) -> Result<(), HandleError> {
        let response = juniper_hyper::graphiql("/graphql", None).await;
        message.response = response;
        Ok(())
    }
    async fn post(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), HandleError> {
        let juniper_context = std::sync::Arc::new(
            graphql::JuniperContext::new(message.clone(), context.clone()),
        );
        let response = juniper_hyper::graphql(
            context.graphql.root_node,
            juniper_context,
            message.clone().request,
        )
        .await;
        Ok(())
    }
    pub async fn handle(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), HandleError> {
        match *message.request.method() {
            hyper::Method::GET => get(message, context).await,
            hyper::Method::POST => post(message, context).await,
            _ => {
                *message.response.status_mut() =
                    hyper::StatusCode::METHOD_NOT_ALLOWED;
                *message.response.body_mut() = hyper::Body::empty();
                Ok(())
            }
        }
    }
}

async fn handle_message(
    message: &mut message::Message,
    context: context::Context,
) -> Result<(), HandleError> {
    let jwt_regex = regex::Regex::new("/jwt/refresh/?$")?;
    if jwt_regex.is_match(message.request.uri().path()) {
        jwt::handle(message, context).await?;
        return Ok(());
    }

    let graphql_regex = regex::Regex::new("/graphql/?$")?;
    if graphql_regex.is_match(message.request.uri().path()) {
        gql::handle(message, context).await?;
        return Ok(());
    }

    Ok(())
}

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    address: std::net::SocketAddr,
    context: context::Context,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    /* Construct message */
    let response = hyper::Response::new(hyper::Body::empty());
    let mut message = message::Message::new(request, response, address);

    match handle_message(&mut message, context).await {
        Ok(()) => (),
        Err(_error) => {
            *message.response.status_mut() =
                hyper::StatusCode::INTERNAL_SERVER_ERROR;
            *message.response.body_mut() = hyper::Body::empty();
        }
    }

    /* Respond */
    Ok(message.done())
}
