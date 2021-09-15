mod turtle;

#[tokio::main]
pub async fn main() {
    let context = turtle::context::Context::new();
    let mut server = turtle::server::Server::new(context);
    server.serve().await;
}
