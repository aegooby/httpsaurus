use super::auth;
use super::context;
use super::error;
use super::graphql;
use super::message;

mod jwt {
    use super::*;
    use auth::Token;
    async fn post(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), error::Error> {
        match message.cookies.get("refresh") {
            Some(refresh) => {
                /* Extract claims found in the cookie. */
                let claims = context.auth.refresh.verify(refresh.to_string())?;

                /* Extract claims from Redis */
                let mut json = context.redis.json().await?;
                let path = Some("$".to_string());
                let result = json.get(claims.sub.clone(), path, None).await?;
                let user = serde_json::from_str::<auth::Claims>(result.as_str())?;

                /* If the refresh token is valid, then create an access token. */
                let access_token = if user.jti == claims.jti {
                    context.auth.refresh.create(user.clone(), message)?;
                    *message.response.status_mut() = hyper::StatusCode::OK;
                    context.auth.access.create(user, message)?
                } else {
                    "".to_string()
                };
                let json = serde_json::json!({ "token": access_token });
                *message.response.body_mut() = hyper::Body::from(json.to_string());
            }
            None => {
                *message.response.status_mut() = hyper::StatusCode::UNAUTHORIZED;
            }
        }
        Ok(())
    }
    pub async fn handle(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), error::Error> {
        match *message.request.method() {
            hyper::Method::POST => post(message, context).await,
            _ => {
                *message.response.status_mut() = hyper::StatusCode::METHOD_NOT_ALLOWED;
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
    ) -> Result<(), error::Error> {
        let response = juniper_hyper::graphiql("/graphql", None).await;
        message.response = response;
        Ok(())
    }
    async fn post(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), error::Error> {
        let juniper_context = std::sync::Arc::new(graphql::JuniperContext::new(
            message.clone().await,
            context.clone(),
        ));
        let response = juniper_hyper::graphql(
            context.graphql.root_node,
            juniper_context,
            message.clone().await.request,
        )
        .await;
        message.response = response;
        Ok(())
    }
    pub async fn handle(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), error::Error> {
        match *message.request.method() {
            hyper::Method::GET => get(message, context).await,
            hyper::Method::POST => post(message, context).await,
            _ => {
                *message.response.status_mut() = hyper::StatusCode::METHOD_NOT_ALLOWED;
                *message.response.body_mut() = hyper::Body::empty();
                Ok(())
            }
        }
    }
}

mod web {
    use super::*;
    async fn get(
        message: &mut message::Message,
        _context: context::Context,
    ) -> Result<(), error::Error> {
        let uri_path = message.request.uri().path();
        let pathname = match uri_path.strip_prefix("/") {
            Some(stripped) => stripped,
            None => uri_path,
        };
        let dist_root = std::path::Path::new(".").join("dist");
        let path = match std::fs::metadata(dist_root.join(pathname)) {
            Ok(metadata) => {
                if metadata.is_file() {
                    dist_root.join(pathname)
                } else {
                    dist_root.join("index.html")
                }
            }
            Err(_error) => dist_root.join("index.html"),
        };
        let file = tokio::fs::File::open(path.clone()).await?;
        let stream = tokio_util::io::ReaderStream::new(file);
        *message.response.body_mut() = hyper::Body::wrap_stream(stream);

        /* Guess "content-type" header. */
        let content_type = match mime_guess::from_path(path).first() {
            Some(guess) => hyper::http::HeaderValue::from_str(guess.to_string().as_str()),
            None => hyper::http::HeaderValue::from_str(mime::TEXT_PLAIN_UTF_8.to_string().as_str()),
        }?;
        message
            .response
            .headers_mut()
            .insert(hyper::header::CONTENT_TYPE, content_type);

        *message.response.status_mut() = hyper::StatusCode::OK;
        Ok(())
    }
    pub async fn handle(
        message: &mut message::Message,
        context: context::Context,
    ) -> Result<(), error::Error> {
        match *message.request.method() {
            hyper::Method::GET => get(message, context).await,
            _ => {
                *message.response.status_mut() = hyper::StatusCode::METHOD_NOT_ALLOWED;
                *message.response.body_mut() = hyper::Body::empty();
                Ok(())
            }
        }
    }
}

async fn handle_message(
    message: &mut message::Message,
    context: context::Context,
) -> Result<(), error::Error> {
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

    web::handle(message, context).await?;
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
            *message.response.status_mut() = hyper::StatusCode::INTERNAL_SERVER_ERROR;
            *message.response.body_mut() = hyper::Body::empty();
        }
    }

    /* Respond */
    Ok(message.done())
}
