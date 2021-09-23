use crate::core::{context, error, message, process, routes};

async fn route(
    message: &mut message::Message,
    context: context::Context,
) -> Result<(), error::Error> {
    let jwt_regex = regex::Regex::new("/jwt/refresh/?$")?;
    if jwt_regex.is_match(message.request.uri().path()) {
        routes::jwt_refresh::handle(message, context).await?;
        return Ok(());
    }

    let graphql_regex = regex::Regex::new("/graphql/?$")?;
    if graphql_regex.is_match(message.request.uri().path()) {
        routes::gql::handle(message, context).await?;
        return Ok(());
    }

    routes::web::handle(message, context).await?;
    Ok(())
}

async fn handle_message(
    message: &mut message::Message,
    context: context::Context,
) -> Result<(), error::Error> {
    route(message, context).await?;
    process::content_type::guess(message).await?;
    Ok(())
}

pub async fn handle(
    request: hyper::Request<hyper::Body>,
    address: std::net::SocketAddr,
    context: context::Context,
) -> Result<hyper::Response<hyper::Body>, std::convert::Infallible> {
    /* Construct message */
    let response = hyper::Response::new(hyper::Body::empty());
    let mut message = message::Message::new(request, response, address);

    match handle_message(&mut message, context).await {
        Ok(()) => (),
        Err(error) => {
            crate::console_warn!("500: {}", error);
            *message.response.status_mut() = hyper::StatusCode::INTERNAL_SERVER_ERROR;
            *message.response.body_mut() = hyper::Body::empty();
        }
    }

    /* Respond */
    Ok(message.done())
}
