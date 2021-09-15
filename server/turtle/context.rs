use super::{auth, error, graphql, redis};

#[derive(Clone)]
pub struct Context {
    pub auth: auth::AuthContext,
    pub redis: redis::RedisContext,
    pub graphql: graphql::GraphQLContext,
}
impl Context {
    pub fn new() -> Result<Self, error::Error> {
        let instance = Self {
            auth: auth::AuthContext::new()?,
            redis: redis::RedisContext::new()?,
            graphql: graphql::GraphQLContext::new()?,
        };
        Ok(instance)
    }
}
