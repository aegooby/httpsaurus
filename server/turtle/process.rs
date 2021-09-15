use super::{error, message};

pub mod etag {
    pub fn calculate(metadata: &std::fs::Metadata) -> String {
        fn parse_modified(metadata: &std::fs::Metadata) -> String {
            match metadata.modified() {
                Ok(modified) => {
                    if let Ok(duration) = modified.duration_since(std::time::UNIX_EPOCH) {
                        let time = duration.as_secs();
                        format!("{:#x}", time)
                    } else {
                        "0".to_string()
                    }
                }
                Err(_error) => "0".to_string(),
            }
        }
        fn parse_size(metadata: &std::fs::Metadata) -> String {
            format!("{:#x}", metadata.len())
        }
        let modified = parse_modified(metadata);
        let size = parse_size(metadata);
        format!("W/{}-{}", size, modified)
    }
    pub fn if_none_match(value: &String, etag: &String) -> bool {
        if value.trim() == "*" {
            false
        } else {
            value.contains(etag)
        }
    }
}

pub mod file {
    use std::str::FromStr;

    use super::*;
    use strum::IntoEnumIterator;
    #[derive(Clone, Copy, Debug, std::hash::Hash, PartialEq, Eq, strum::EnumIter)]
    enum Encoding {
        Deflate,
        Gzip,
        Brotli,
    }
    impl std::fmt::Display for Encoding {
        fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                Encoding::Deflate => write!(formatter, "deflate"),
                Encoding::Gzip => write!(formatter, "gzip"),
                Encoding::Brotli => write!(formatter, "br"),
            }
        }
    }
    type EncodingSet = std::collections::HashSet<Encoding>;
    fn encodings(message: &mut message::Message) -> Result<EncodingSet, error::Error> {
        let mut set = EncodingSet::new();
        for value in message
            .response
            .headers()
            .get_all(hyper::header::ACCEPT_ENCODING)
        {
            let header = value.to_str()?.to_string();
            for encoding in Encoding::iter() {
                if header.contains(encoding.to_string().as_str()) {
                    set.insert(encoding);
                }
            }
        }
        Ok(set)
    }
    fn compress(
        encoding: Encoding,
        stream: tokio_util::io::ReaderStream<tokio::fs::File>,
    ) -> hyper::Body {
        //-> tokio_util::io::ReaderStream {
        let reader = tokio_util::io::StreamReader::new(stream);
        match encoding {
            Encoding::Deflate => {
                let encoding = async_compression::tokio::bufread::DeflateEncoder::new(reader);
                let stream = tokio_util::io::ReaderStream::new(encoding);
                hyper::Body::wrap_stream(stream)
            }
            Encoding::Gzip => {
                let encoding = async_compression::tokio::bufread::GzipEncoder::new(reader);
                let stream = tokio_util::io::ReaderStream::new(encoding);
                hyper::Body::wrap_stream(stream)
            }
            Encoding::Brotli => {
                let encoding = async_compression::tokio::bufread::BrotliEncoder::new(reader);
                let stream = tokio_util::io::ReaderStream::new(encoding);
                hyper::Body::wrap_stream(stream)
            }
        }
    }
    pub async fn send(
        message: &mut message::Message,
        path: &std::path::Path,
    ) -> Result<(), error::Error> {
        let metadata = tokio::fs::metadata(path.clone()).await?;
        let file = tokio::fs::File::open(path.clone()).await?;
        let stream = tokio_util::io::ReaderStream::new(file);

        let encodings = encodings(message)?;
        if encodings.is_empty() {
            *message.response.body_mut() = hyper::Body::wrap_stream(stream);
        } else {
            for encoding in Encoding::iter() {
                if encodings.contains(&encoding) {
                    let headers = message.response.headers_mut();
                    headers.remove(hyper::header::CONTENT_LENGTH);
                    let encoding_value =
                        hyper::header::HeaderValue::from_str(encoding.to_string().as_str())?;
                    headers.append(hyper::header::CONTENT_ENCODING, encoding_value);
                    *message.response.body_mut() = compress(encoding, stream);
                    break;
                }
            }
        }

        let mut mtime = None as Option<u64>;
        if let Some(header) = message.response.headers().get(hyper::header::LAST_MODIFIED) {
            if let Ok(header_str) = header.to_str() {
                if let Ok(last_modified) = header_str.parse() {
                    mtime = Some(last_modified)
                }
            }
        } else if let Ok(modified) = metadata.modified() {
            let last_modified = modified.duration_since(std::time::UNIX_EPOCH)?.as_secs();
            mtime = Some(last_modified);
            let value = hyper::header::HeaderValue::from_str(last_modified.to_string().as_str())?;
            message
                .response
                .headers_mut()
                .insert(hyper::header::LAST_MODIFIED, value);
        }

        if !message
            .response
            .headers()
            .contains_key(hyper::header::CACHE_CONTROL)
        {
            let value = hyper::header::HeaderValue::from_static("max-age=0");
            message
                .response
                .headers_mut()
                .append(hyper::header::CACHE_CONTROL, value);
        }
        if let Some(value) = message.response.headers().get(hyper::header::IF_NONE_MATCH) {
            if mtime.is_some() {
                if let Ok(value) = value.to_str() {
                    let etag = etag::calculate(&metadata);
                    if !etag::if_none_match(&value.to_string(), &etag) {
                        let value = hyper::header::HeaderValue::from_str(etag.as_str())?;
                        message
                            .response
                            .headers_mut()
                            .append(hyper::header::ETAG, value);
                        *message.response.status_mut() = hyper::StatusCode::NOT_MODIFIED;
                    }
                }
            }
        }
        if let Some(value) = message
            .response
            .headers()
            .get(hyper::header::IF_MODIFIED_SINCE)
        {
            if let Some(mtime) = mtime {
                if let Ok(value) = value.to_str() {
                    let date = chrono::DateTime::<chrono::Utc>::from_str(value)?;
                    if date.timestamp() as u64 > mtime {
                        *message.response.status_mut() = hyper::StatusCode::NOT_MODIFIED;
                    }
                }
            }
        }

        Ok(())
    }
}

pub mod content_type {
    use super::*;
    fn mime_to_header(mime_type: mime::Mime) -> Result<hyper::http::HeaderValue, error::Error> {
        Ok(hyper::http::HeaderValue::from_str(
            mime_type.to_string().as_str(),
        )?)
    }
    pub async fn html(message: &mut message::Message) -> Result<(), error::Error> {
        let content_type = mime_to_header(mime::TEXT_HTML_UTF_8)?;
        message
            .response
            .headers_mut()
            .append(hyper::header::CONTENT_TYPE, content_type);
        Ok(())
    }
    pub async fn guess(message: &mut message::Message) -> Result<(), error::Error> {
        if message
            .response
            .headers()
            .contains_key(hyper::header::CONTENT_TYPE)
        {
            return Ok(());
        }
        let path = message.request.uri().path();
        let content_type = match mime_guess::from_path(path).first() {
            Some(guess) => mime_to_header(guess),
            None => mime_to_header(mime::TEXT_PLAIN_UTF_8),
        }?;
        message
            .response
            .headers_mut()
            .insert(hyper::header::CONTENT_TYPE, content_type);
        Ok(())
    }
}

/* @todo: add ETag processing */
