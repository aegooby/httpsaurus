mod turtle;

#[tokio::main]
pub async fn main() {
    match turtle::context::Context::new() {
        Ok(context) => {
            let mut server = turtle::server::Server::new(context);
            server.serve().await;
        }
        Err(error) => {
            crate::console_error!("Failed to create context with error: {}", error);
        }
    }
}
