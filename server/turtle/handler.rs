use super::server;

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    context: server::Context,
    address: std::net::SocketAddr,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    Ok(hyper::Response::new(hyper::Body::default()))
}
