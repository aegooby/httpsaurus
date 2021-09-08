mod turtle;

#[tokio::main]
pub async fn main() {
    // let redis = turtle::redis::RedisContext::new(None);
    // let schema_field = turtle::redis::FTSchemaField::build()
    //     .name("$.email".to_string())
    //     .field_type("TAG".to_string())
    //     .field_as("email".to_string());
    // let schema_fields = vec![schema_field];
    // let result = redis
    //     .search()
    //     .await
    //     .unwrap()
    //     .create("users".to_string(), "JSON".to_string(), schema_fields, None)
    //     .await;
    // match result {
    //     Ok(value) => println!("{}", value),
    //     Err(error) => println!("{}", error),
    // }
    // let result = redis
    //     .search()
    //     .await
    //     .unwrap()
    //     .search("users".to_string(), "@email:{awonko}".to_string(), None)
    //     .await;
    // match result {
    //     Ok(value) => {
    //         for result in value.results {
    //             println!(
    //                 "key: {}, path: {}, value: {}",
    //                 result.key, result.path, result.value
    //             );
    //         }
    //     }
    //     Err(error) => println!("{}", error),
    // }
    let context = turtle::context::Context::new();
    let mut server = turtle::server::Server::new(context);
    server.serve().await;
}
