pub struct GraphQLContextRef {
    pub root_node: juniper::RootNode<
        'static,
        juniper::EmptyMutation,
        juniper::EmptyMutation,
        juniper::EmptySubscription,
    >,
}
impl GraphQLContextRef {
    pub fn new() -> Self {
        Self {
            root_node: juniper::RootNode::new(
                juniper::EmptyMutation::new(),
                juniper::EmptyMutation::new(),
                juniper::EmptySubscription::new(),
            ),
        }
    }
}
#[derive(Clone)]
pub struct GraphQLContext(std::sync::Arc<GraphQLContextRef>);
impl GraphQLContext {
    pub fn new() -> Self {
        Self {
            0: std::sync::Arc::new(GraphQLContextRef::new()),
        }
    }
}
