use super::auth;
use super::graphql;
use super::redis;

#[derive(Clone)]
pub struct Context {
    pub auth: auth::AuthContext,
    pub redis: redis::RedisContext,
    pub graphql: graphql::GraphQLContext,
}
impl Context {
    pub fn new() -> Context {
        Context {
            auth: auth::AuthContext::new(),
            redis: redis::RedisContext::new(),
            graphql: graphql::GraphQLContext::new(),
        }
    }
}
