pub use redis::AsyncCommands;
mod turtle;

#[tokio::main]
pub async fn main() {
    let mut redis = turtle::redis::Redis::new();
    let schema_field = turtle::redis::FTSchemaField::build()
        .name("$.id".to_string())
        .field_type("TAG".to_string())
        .field_as("email".to_string());
    let schema_fields = vec![schema_field];
    let result = redis
        .search()
        .await
        .unwrap()
        .create("users".to_string(), "JSON".to_string(), schema_fields, None)
        .await;
    if let Ok(value) = result {
        println!("{}", value);
    }
    // let context = turtle::server::Context::new();
    // let mut server = turtle::server::Server::new(context);
    // server.serve().await;
}
