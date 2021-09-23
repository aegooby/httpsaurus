#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct AdditionalData {
    pub email: String,
}
impl AdditionalData {
    pub fn new(email: String) -> Self {
        Self { email }
    }
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Payload {
    pub id: juniper::ID,
    pub jti: Option<String>,
    pub email: String,
}
