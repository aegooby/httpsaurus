mod core;
mod custom;

#[cfg(debug_assertions)]
async fn __main() -> Result<(), core::error::Error> {
    let context = core::context::Context::new()?;
    custom::redis::index(&context).await?;
    let mut server = core::server::Server::new(context, [127, 0, 0, 1]);
    server.serve().await;
    Ok(())
}
#[cfg(not(debug_assertions))]
async fn __main() -> Result<(), core::error::Error> {
    let context = core::context::Context::new()?;
    custom::redis::index(&context).await?;
    let mut server = core::server::Server::new(context, [0, 0, 0, 0]);
    server.serve().await;
    Ok(())
}

#[tokio::main]
pub async fn main() {
    match __main().await {
        Ok(()) => (),
        Err(error) => {
            crate::console_error!("Failed to create context with error: {}", error);
        }
    }
}
