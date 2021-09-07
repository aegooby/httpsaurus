use tokio::runtime::Handle;

use super::auth::Token;
use super::message;
use super::server;

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
impl From<json::JsonError> for HandleError {
    fn from(_: json::JsonError) -> Self {
        Self {}
    }
}

mod auth {
    use super::HandleError;

    use super::message;
    use super::server;
    use super::Token;
    pub async fn handle(
        message: &mut message::Message,
        context: server::Context,
    ) -> Result<(), HandleError> {
        if let Some(refresh) = message.cookies.get("refresh") {
            let claims = context.auth.refresh.verify(refresh.to_string())?;
            let mut json = context.redis.json().await?;
            let path = Some("$".to_string());
            let result = json.get(claims.sub, path, None).await?;
            let claims_json = json::parse(result.as_str())?;
        }
        Ok(())
    }
}

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    address: std::net::SocketAddr,
    context: server::Context,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    let response = hyper::Response::new(hyper::Body::default());
    let message = message::Message::new(request, response, address);
    Ok(message.done())
}
