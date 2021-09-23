#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct AdditionalData {
    pub email: String,
}
impl AdditionalData {
    pub fn new(email: String) -> Self {
        Self { email }
    }
}
