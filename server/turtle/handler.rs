use super::message;
use super::server;

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    address: std::net::SocketAddr,
    context: server::Context,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    let response = hyper::Response::new(hyper::Body::default());
    let message = message::Message::new(request, response, address);
    Ok(hyper::Response::new(hyper::Body::default()))
}
