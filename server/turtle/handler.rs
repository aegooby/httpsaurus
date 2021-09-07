use super::auth::Token;
use super::message;
use super::server;

mod auth {
    use super::message;
    use super::server;
    use super::Token;
    pub async fn handle(
        message: &mut message::Message,
        context: &mut server::Context,
    ) {
        if let Some(refresh) = message.cookies.get("refresh") {
            if let Ok(claims) = context.auth.refresh.verify(refresh.to_string())
            {
                if let Ok(mut json) = context.redis.json().await {
                    let path = Some("$".to_string());
                    if let Ok(result) = json.get(claims.sub, path, None).await {
                    }
                }
            }
        }
    }
}

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    address: std::net::SocketAddr,
    context: &mut server::Context,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    let response = hyper::Response::new(hyper::Body::default());
    let message = message::Message::new(request, response, address);
    Ok(message.done())
}
