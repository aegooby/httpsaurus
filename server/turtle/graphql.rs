use super::{context, error, message};
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
    pub fn new() -> Result<Self, error::Error> {
        crate::console_log!("Creating GraphQL context...");

        let root_node = juniper::RootNode::new(
            Query {},
            juniper::EmptyMutation::<JuniperContext>::new(),
            juniper::EmptySubscription::<JuniperContext>::new(),
        );
        let schema = root_node.as_schema_language();
        let schema_path = std::path::Path::new(".").join("graphql").join("schema.gql");
        std::fs::write(schema_path, schema)?;
        let instance = Self {
            root_node: std::sync::Arc::new(root_node),
        };
        Ok(instance)
    }
}
