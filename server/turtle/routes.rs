use super::{auth, context, error, graphql, message, process};
pub mod jwt {
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

pub mod gql {
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

pub mod web {
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
                    process::content_type::html(message).await?;
                    dist_root.join("index.html")
                }
            }
            Err(_error) => {
                process::content_type::html(message).await?;
                dist_root.join("index.html")
            }
        };

        process::file(message, &path).await?;

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
