use crate::core::graphql;

pub trait New {
    fn new() -> Self;
}

#[derive(juniper::GraphQLObject)]
struct Error {
    message: String,
}

#[juniper::graphql_interface]
trait Node {
    fn id(&self) -> juniper::ID;
}

pub struct Query;
#[juniper::graphql_object(context = graphql::JuniperContext)]
impl Query {
    pub fn request() -> &'static str {
        return "response";
    }
}
impl New for Query {
    fn new() -> Self {
        Self {}
    }
}

pub type Mutation = juniper::EmptyMutation<graphql::JuniperContext>;
pub type Subscription = juniper::EmptySubscription<graphql::JuniperContext>;
