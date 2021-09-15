use super::{context, message};
pub struct JuniperContext {
    pub message: message::Message,
    pub context: context::Context,
}
impl JuniperContext {
    pub fn new(message: message::Message, context: context::Context) -> Self {
        Self { message, context }
    }
}
impl juniper::Context for JuniperContext {}

pub struct Query;
#[juniper::graphql_object(context = JuniperContext)]
impl Query {
    pub fn request() -> &'static str {
        return "response";
    }
}

#[derive(Clone)]
pub struct GraphQLContext {
    pub root_node: std::sync::Arc<
        juniper::RootNode<
            'static,
            Query,
            juniper::EmptyMutation<JuniperContext>,
            juniper::EmptySubscription<JuniperContext>,
        >,
    >,
}
impl GraphQLContext {
    pub fn new() -> Self {
        Self {
            root_node: std::sync::Arc::new(juniper::RootNode::new(
                Query {},
                juniper::EmptyMutation::<JuniperContext>::new(),
                juniper::EmptySubscription::<JuniperContext>::new(),
            )),
        }
    }
}
