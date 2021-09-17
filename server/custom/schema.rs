use crate::core::graphql;

pub trait New {
    fn new() -> Self;
}

#[derive(juniper::GraphQLObject)]
struct Error {
    message: String,
}

#[juniper::graphql_interface(for = [User])]
trait Node {
    fn id(&self) -> juniper::ID;
}

#[derive(juniper::GraphQLObject)]
#[graphql(impl = NodeValue)]
struct User {
    id: juniper::ID,
    email: String,
}
#[juniper::graphql_interface]
impl Node for User {
    fn id(&self) -> juniper::ID {
        self.id.clone()
    }
}

pub struct Query;
#[juniper::graphql_object(context = graphql::JuniperContext)]
impl Query {
    pub fn request() -> &'static str {
        return "response";
    }
    pub fn node(id: juniper::ID) -> NodeValue {
        User {
            id,
            email: "@.com".to_string(),
        }
        .into()
    }
}
impl New for Query {
    fn new() -> Self {
        Self {}
    }
}

pub type Mutation = juniper::EmptyMutation<graphql::JuniperContext>;
pub type Subscription = juniper::EmptySubscription<graphql::JuniperContext>;
