#[derive(Clone, Debug)]
pub struct Error {
    message: String,
}
impl Error {
    pub fn new_string(message: String) -> Self {
        Self { message }
    }
    pub fn new_str(message: &'static str) -> Self {
        Self {
            message: message.to_string(),
        }
    }
}
impl std::error::Error for Error {}
impl std::fmt::Display for Error {
    fn fmt(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(formatter, "{}", self.message)
    }
}

impl From<hyper::http::Error> for Error {
    fn from(error: hyper::http::Error) -> Self {
        Self::new_string(format!("Hyper HTTP error: {}", error))
    }
}
impl From<hyper::Error> for Error {
    fn from(error: hyper::Error) -> Self {
        Self::new_string(format!("Hyper error: {}", error))
    }
}
impl From<jsonwebtoken::errors::Error> for Error {
    fn from(error: jsonwebtoken::errors::Error) -> Self {
        Self::new_string(format!("JWT error: {}", error))
    }
}
impl From<redis::RedisError> for Error {
    fn from(error: redis::RedisError) -> Self {
        Self::new_string(format!("Redis error: {}", error))
    }
}
impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Self::new_string(format!("Serde error: {}", error))
    }
}
impl From<regex::Error> for Error {
    fn from(error: regex::Error) -> Self {
        Self::new_string(format!("Regex error: {}", error))
    }
}
impl From<html_parser::Error> for Error {
    fn from(error: html_parser::Error) -> Self {
        Self::new_string(format!("HTML parser error: {}", error))
    }
}
impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::new_string(format!("IO error: {}", error))
    }
}
impl From<hyper::header::InvalidHeaderValue> for Error {
    fn from(error: hyper::header::InvalidHeaderValue) -> Self {
        Self::new_string(format!("Hyper header error: {}", error))
    }
}
impl From<hyper::http::uri::InvalidUriParts> for Error {
    fn from(error: hyper::http::uri::InvalidUriParts) -> Self {
        Self::new_string(format!("Hyper URI parts error: {}", error))
    }
}
impl From<hyper::header::ToStrError> for Error {
    fn from(error: hyper::header::ToStrError) -> Self {
        Self::new_string(format!("Hyper header conversion error: {}", error))
    }
}
impl From<std::num::ParseIntError> for Error {
    fn from(error: std::num::ParseIntError) -> Self {
        Self::new_string(format!("Int parse error: {}", error))
    }
}
impl From<std::time::SystemTimeError> for Error {
    fn from(error: std::time::SystemTimeError) -> Self {
        Self::new_string(format!("System time error: {}", error))
    }
}
impl From<chrono::ParseError> for Error {
    fn from(error: chrono::ParseError) -> Self {
        Self::new_string(format!("Chrono parse error: {}", error))
    }
}
impl From<rsa::errors::Error> for Error {
    fn from(error: rsa::errors::Error) -> Self {
        Self::new_string(format!("RSA error: {}", error))
    }
}
impl From<rsa::pkcs8::Error> for Error {
    fn from(error: rsa::pkcs8::Error) -> Self {
        Self::new_string(format!("RSA PKCS8 error: {}", error))
    }
}
