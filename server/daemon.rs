mod turtle;

#[tokio::main]
pub async fn main() {
    let context = turtle::server::Context::new();
    let server = turtle::server::Server::new(context);
    server.serve().await;
}
