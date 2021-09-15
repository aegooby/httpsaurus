use super::{error, message};

pub async fn file(
    message: &mut message::Message,
    path: &std::path::Path,
) -> Result<(), error::Error> {
    let file = tokio::fs::File::open(path.clone()).await?;
    let stream = tokio_util::io::ReaderStream::new(file);
    *message.response.body_mut() = hyper::Body::wrap_stream(stream);

    /* @todo: add compresion */

    Ok(())
}

/** Guess "content-type" header. */
pub async fn content_type(message: &mut message::Message) -> Result<(), error::Error> {
    if message
        .response
        .headers()
        .contains_key(hyper::header::CONTENT_TYPE)
    {
        return Ok(());
    }
    let path = message.request.uri().path();
    let content_type = match mime_guess::from_path(path).first() {
        Some(guess) => hyper::http::HeaderValue::from_str(guess.to_string().as_str()),
        None => hyper::http::HeaderValue::from_str(mime::TEXT_PLAIN_UTF_8.to_string().as_str()),
    }?;
    message
        .response
        .headers_mut()
        .insert(hyper::header::CONTENT_TYPE, content_type);
    Ok(())
}

/* @todo: add ETag processing */
