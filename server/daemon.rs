mod turtle;

#[tokio::main]
pub async fn main() {
    let context = turtle::server::Context::new();
    let mut server = turtle::server::Server::new(context);
    server.serve().await;
}
