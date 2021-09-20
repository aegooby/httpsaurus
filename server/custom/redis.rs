use crate::core::{context, error, redis};
use crate::custom::schema;

pub trait RedisIndex {
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

impl RedisIndex for schema::User {
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

pub async fn index(context: &context::Context) -> Result<(), error::Error> {
    let (name, schema_fields, parameters) = schema::User::index();
    let mut redis_search = context.redis.search().await?;
    let _ = redis_search
        .create(name, "JSON".into(), schema_fields, parameters)
        .await;
    Ok(())
}
