mod core;
mod custom;

#[tokio::main]
pub async fn main() {
    match core::context::Context::new() {
        Ok(context) => {
            let mut server = core::server::Server::new(context);
            server.serve().await;
        }
        Err(error) => {
            crate::console_error!("Failed to create context with error: {}", error);
        }
    }
}
