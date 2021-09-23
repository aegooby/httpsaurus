use crate::core::{auth, error, graphql, util};
use crate::custom::{jwt, redis};

use self::redis::RedisIndex;
use auth::Token;

#[derive(juniper::GraphQLObject)]
pub struct Error {
    message: String,
}

#[juniper::graphql_interface(for = [User])]
pub trait Node {
    fn id(&self) -> juniper::ID;
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct User {
    id: juniper::ID,
    email: String,
    password: String,
}
#[juniper::graphql_object(impl = NodeValue)]
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

pub struct Query;
#[juniper::graphql_object(context = graphql::JuniperContext)]
impl Query {
    pub fn request(_context: &graphql::JuniperContext) -> &'static str {
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
                let mut redis_json = context.global.redis.json().await?;
                let json_data = match redis_json.get(id.clone(), None, None).await {
                    Ok(data) => Ok(data),
                    Err(_error) => {
                        let message = format!("No JSON data found for id {}", id);
                        Err(error::Error::new_string(message))
                    }
                }?;
                let user = serde_json::from_str::<User>(json_data.as_str())?;
                return Ok(user.into());
            }
        }
        let error_message = format!("No node found with id {}", id);
        Err(error::Error::new_string(error_message).into())
    }

    pub async fn read_user(
        email: String,
        context: &graphql::JuniperContext,
    ) -> juniper::FieldResult<User> {
        let message = context.message.try_read()?;
        let claims = auth::util::authenticate(&message, &context.global)?;
        if claims.ajd.email != email {
            let message = format!("Failed to authenticate user with email {}", email);
            return Err(error::Error::new_string(message).into());
        }
        let query = format!(
            "@email:{{{}}}",
            email.replace("@", "\\@").replace(".", "\\.")
        );
        // let mut redis_search = context.global.redis.search().await?;
        // let search_result = redis_search.search(User::index_name(), query, None).await?;
        // if search_result.results.len() > 1 {
        //     let message = format!("More than one user found with email {}", email);
        //     return Err(error::Error::new_string(message).into());
        // }
        // match search_result.results.first() {
        //     Some(result) => {
        //         let user = serde_json::from_str::<User>(result.value.as_str())?;
        //         Ok(user)
        //     }
        //     None => {
        //         let message = format!("No user found with email {}", email);
        //         Err(error::Error::new_string(message).into())
        //     }
        // }
        Err(error::Error::new_str("").into())
    }

    // pub async fn read_current_user(
    //     context: &graphql::JuniperContext,
    // ) -> juniper::FieldResult<User> {
    //     let message = &*context.message.try_read()?;
    //     let claims = auth::util::authenticate(message, &context.context)?;
    //     let mut redis_json = context.context.redis.json().await?;
    //     let json_result = redis_json.get(claims.sub, None, None).await?;
    //     let user = serde_json::from_str::<User>(json_result.as_str())?;
    //     Ok(user)
    // }
}
impl Query {
    pub fn new() -> Self {
        Self {}
    }
}
pub struct Mutation;
#[juniper::graphql_object(context = graphql::JuniperContext)]
impl Mutation {
    pub async fn create_user(
        email: String,
        password: String,
        context: &graphql::JuniperContext,
    ) -> juniper::FieldResult<User> {
        use scrypt::password_hash::PasswordHasher;

        let id = format!("{}{}", User::prefix(), util::uuid());
        let query = format!(
            "@email:{{{}}}",
            email.replace("@", "\\@").replace(".", "\\.")
        );
        let mut redis_search = context.global.redis.search().await?;
        let search_result = redis_search.search(User::index_name(), query, None).await?;
        if search_result.results.len() > 0 {
            let message = format!("Email {} is already in use", email);
            return Err(error::Error::new_string(message).into());
        }

        let hashed_password = scrypt::Scrypt
            .hash_password(password.as_bytes(), &context.global.auth.salt)?
            .to_string() as String;

        let user = User {
            id: id.clone().into(),
            email,
            password: hashed_password,
        };
        let mut redis_json = context.global.redis.json().await?;
        redis_json
            .set(id, "$".into(), serde_json::to_string(&user)?, None)
            .await?;

        Ok(user)
    }
    pub async fn login_user(
        email: String,
        password: String,
        context: &mut graphql::JuniperContext,
    ) -> juniper::FieldResult<String> {
        use scrypt::password_hash::PasswordVerifier;

        let query = format!(
            "@email:{{{}}}",
            email.replace("@", "\\@").replace(".", "\\.")
        );
        let mut redis_search = context.global.redis.search().await?;
        let search_result = redis_search.search(User::index_name(), query, None).await?;
        if search_result.results.len() > 1 {
            let message = format!("More than one user found with email {}", email);
            return Err(error::Error::new_string(message).into());
        }
        match search_result.results.first() {
            Some(result) => {
                let user = serde_json::from_str::<User>(result.value.as_str())?;
                let parsed_hash = scrypt::password_hash::PasswordHash::new(user.password.as_str())?;
                if scrypt::Scrypt
                    .verify_password(user.password.as_bytes(), &parsed_hash)
                    .is_ok()
                {
                    let message = format!("Incorrect password for user with email {}", email);
                    Err(error::Error::new_string(message).into())
                } else {
                    let claims = auth::Claims::new(
                        user.id.to_string(),
                        jwt::AdditionalData::new(user.email),
                    );
                    // let message = &mut (context.message);
                    // let token = context.context.auth.access.create(claims, message)?;
                    Ok("".into())
                }
            }
            None => {
                let message = format!("No user found with email {}", email);
                Err(error::Error::new_string(message).into())
            }
        }
    }
}
impl Mutation {
    pub fn new() -> Self {
        Self {}
    }
}

pub type Subscription = juniper::EmptySubscription<graphql::JuniperContext>;
