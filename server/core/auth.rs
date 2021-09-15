use crate::core::{error, message};
use crate::custom::jwt;

use rsa::{pkcs8::ToPrivateKey, pkcs8::ToPublicKey};

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub ajd: jwt::AdditionalData, /* Additional JSON Data claim. */
    pub jti: Option<String>,      /* JWT receipt. */
}

pub trait Token {
    fn new(lifetime: usize, path: String) -> Result<Self, error::Error>
    where
        Self: Sized;
    fn expiry(lifetime: usize) -> Result<usize, error::Error> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs() as usize;
        Ok(now + lifetime)
    }
    fn private(&self) -> String;
    fn public(&self) -> String;
    fn create(
        &self,
        payload: Claims,
        message: &mut message::Message,
    ) -> Result<String, error::Error>;
    fn verify(&self, token: String) -> Result<Claims, error::Error> {
        let algorithm = jsonwebtoken::Algorithm::RS256;
        let validation = jsonwebtoken::Validation::new(algorithm);
        let public_key = self.public();
        let key = jsonwebtoken::DecodingKey::from_rsa_pem(public_key.as_bytes())?;
        let claims = jsonwebtoken::decode::<Claims>(token.as_str(), &key, &validation)?.claims;
        Ok(claims)
    }
}
#[derive(Clone, Debug)]
pub struct Keypair {
    private: String,
    public: String,
}
impl Keypair {
    fn new() -> Result<Self, error::Error> {
        let private_rsa = rsa::RsaPrivateKey::new(&mut rand::rngs::OsRng, 2048)?;
        let private = private_rsa.to_pkcs8_pem()?.to_string();

        let public_rsa = rsa::RsaPublicKey::from(&private_rsa);
        let public = public_rsa.to_public_key_pem()?;

        let instance = Self { private, public };
        Ok(instance)
    }
}
#[derive(Clone, Debug)]
pub struct AccessToken {
    keypair: Keypair,
    lifetime: usize,
}
impl Token for AccessToken {
    fn new(lifetime: usize, _path: String) -> Result<Self, error::Error> {
        let instance = Self {
            keypair: Keypair::new()?,
            lifetime,
        };
        Ok(instance)
    }
    fn private(&self) -> String {
        self.keypair.private.clone()
    }
    fn public(&self) -> String {
        self.keypair.public.clone()
    }
    fn create(
        &self,
        claims: Claims,
        _message: &mut message::Message,
    ) -> Result<String, error::Error> {
        let algorithm = jsonwebtoken::Algorithm::RS256;
        let header = jsonwebtoken::Header::new(algorithm);
        let private_key = self.private();
        let mut claims = claims.clone();
        claims.exp = AccessToken::expiry(self.lifetime)?;
        let key = jsonwebtoken::EncodingKey::from_rsa_pem(private_key.as_bytes())?;
        Ok(jsonwebtoken::encode(&header, &claims, &key)?)
    }
}
#[derive(Clone, Debug)]
pub struct RefreshToken {
    keypair: Keypair,
    lifetime: usize,
    path: String,
}
impl Token for RefreshToken {
    fn new(lifetime: usize, path: String) -> Result<Self, error::Error> {
        let instance = Self {
            keypair: Keypair::new()?,
            lifetime,
            path,
        };
        Ok(instance)
    }
    fn private(&self) -> String {
        self.keypair.private.clone()
    }
    fn public(&self) -> String {
        self.keypair.public.clone()
    }
    fn create(
        &self,
        claims: Claims,
        message: &mut message::Message,
    ) -> Result<String, error::Error> {
        let algorithm = jsonwebtoken::Algorithm::RS256;
        let header = jsonwebtoken::Header::new(algorithm);
        let private_key = self.private();
        let mut claims = claims.clone();
        claims.exp = AccessToken::expiry(self.lifetime)?;

        match jsonwebtoken::EncodingKey::from_rsa_pem(private_key.as_bytes()) {
            Ok(key) => {
                let token = jsonwebtoken::encode(&header, &claims, &key)?;
                let cookie = cookie::Cookie::build("refresh", token.clone())
                    .http_only(true)
                    .path(self.path.clone())
                    .secure(true)
                    .same_site(cookie::SameSite::Strict)
                    .finish();
                message.cookies.add(cookie);
                Ok(token)
            }
            Err(error) => Err(error.into()),
        }
    }
}
impl RefreshToken {
    fn reset(&self, message: &mut message::Message) {
        let cookie = cookie::Cookie::build("refresh", "")
            .http_only(true)
            .path(self.path.clone())
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .finish();
        message.cookies.remove(cookie);
    }
}
#[derive(Clone, Debug)]
pub struct AuthContext {
    pub access: AccessToken,
    pub refresh: RefreshToken,
}
impl AuthContext {
    pub fn new() -> Result<Self, error::Error> {
        crate::console_log!("Creating authentication context...");

        let access_lifetime = 60 * 15;
        let access = AccessToken::new(access_lifetime, "/jwt/access".to_string())?;
        let refresh_lifetime = 60 * 60 * 24 * 7;
        let refresh = RefreshToken::new(refresh_lifetime, "/jwt/refresh".to_string())?;

        let instance = Self { access, refresh };
        Ok(instance)
    }
}
