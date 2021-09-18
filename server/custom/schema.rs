use crate::core::{error, graphql, redis};

trait RedisIndex {
    fn name() -> String;
    fn prefix() -> String;
    fn tag() -> Option<(String, String)>;

    fn index() -> (
        String,
        Vec<redis::FTSchemaField>,
        Option<redis::FTCreateParameters>,
    ) {
        let schema_fields = match Self::tag() {
            Some((tag_name, tag_as)) => {
                let schema_field = redis::FTSchemaField::build()
                    .name(tag_name.into())
                    .field_type("TAG".into())
                    .field_as(tag_as);
                vec![schema_field]
            }
            None => vec![],
        };
        let prefix = redis::FTCreateParametersPrefix {
            count: 1,
            name: Self::prefix(),
        };
        let create_parameters = redis::FTCreateParameters::build().prefix(&[prefix]);
        (Self::name(), schema_fields, Some(create_parameters))
    }
}

#[derive(juniper::GraphQLObject)]
struct Error {
    message: String,
}

#[juniper::graphql_interface(for = [User])]
trait Node {
    fn id(&self) -> juniper::ID;
}

// juniper::GraphQLObject,
#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct User {
    id: juniper::ID,
    email: String,
    password: String,
}
#[juniper::graphql_object]
#[graphql(impl = NodeValue)]
impl User {
    fn email(&self) -> String {
        self.email.clone()
    }
}
#[juniper::graphql_interface]
impl Node for User {
    fn id(&self) -> juniper::ID {
        self.id.clone()
    }
}
impl RedisIndex for User {
    fn name() -> String {
        "users".into()
    }

    fn prefix() -> String {
        "nodes:users:".into()
    }

    fn tag() -> Option<(String, String)> {
        Some(("$.email".into(), "email".into()))
    }
}

pub struct Query;
#[juniper::graphql_object(context = graphql::JuniperContext)]
impl Query {
    pub fn request() -> &'static str {
        return "response";
    }
    pub async fn node(
        id: juniper::ID,
        context: &graphql::JuniperContext,
    ) -> juniper::FieldResult<NodeValue> {
        let regex = regex::Regex::new("(.*:)*.*")?;
        let id = id.to_string();
        fn prefix(id: &String, regex: &regex::Regex) -> Option<String> {
            let captures = regex.captures(id.as_str())?;
            let prefix = captures.get(1)?;
            Some(prefix.as_str().to_string())
        }
        if let Some(prefix) = prefix(&id, &regex) {
            if prefix == User::prefix() {
                let mut redis_json = context.context.redis.json().await?;
                let json_data = match redis_json.get(id.clone(), None, None).await {
                    Ok(data) => Ok(data),
                    Err(_error) => {
                        let message = format!("No JSON data found for id {}", id);
                        Err(error::Error::new(message))
                    }
                }?;
                let user = serde_json::from_str::<User>(json_data.as_str())?;
                return Ok(user.into());
            }
        }
        let error_message = format!("No node found with id {}", id);
        Err(error::Error::new(error_message).into())
    }

    // pub async fn read_user(email: String) -> Option<User> {}
}
impl Query {
    pub fn new() -> Self {
        Self {}
    }
}

pub type Mutation = juniper::EmptyMutation<graphql::JuniperContext>;
pub type Subscription = juniper::EmptySubscription<graphql::JuniperContext>;
