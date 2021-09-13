use super::error;
#[derive(Debug)]
pub struct Message {
    pub request: hyper::Request<hyper::Body>,
    pub response: hyper::Response<hyper::Body>,
    pub cookies: cookie::CookieJar,
    pub address: std::net::SocketAddr,
}

impl Message {
    pub async fn clone(&mut self) -> Self {
        async fn clone_hyper(
            message: &mut Message,
        ) -> Result<
            (hyper::Request<hyper::Body>, hyper::Response<hyper::Body>),
            error::Error,
        > {
            let request_body =
                hyper::body::to_bytes(message.request.body_mut()).await?;
            *message.request.body_mut() =
                hyper::Body::from(request_body.clone());
            let mut request = hyper::Request::builder()
                .version(message.request.version())
                .method(message.request.method())
                .uri(message.request.uri())
                .body(hyper::Body::from(request_body.clone()))?;
            for (key, value) in message.request.headers() {
                request.headers_mut().append(key, value.clone());
            }

            let response_body =
                hyper::body::to_bytes(message.response.body_mut()).await?;
            *message.response.body_mut() =
                hyper::Body::from(response_body.clone());
            let mut response = hyper::Response::builder()
                .version(message.response.version())
                .status(message.response.status())
                .body(hyper::Body::from(response_body.clone()))?;
            for (key, value) in message.response.headers() {
                response.headers_mut().append(key, value.clone());
            }

            Ok((request, response))
        }
        let (request, response) = match clone_hyper(self).await {
            Ok((request, response)) => (request, response),
            Err(_error) => {
                (hyper::Request::default(), hyper::Response::default())
            }
        };
        Self {
            request,
            response,
            cookies: self.cookies.clone(),
            address: self.address.clone(),
        }
    }
    pub fn new(
        request: hyper::Request<hyper::Body>,
        response: hyper::Response<hyper::Body>,
        address: std::net::SocketAddr,
    ) -> Self {
        let mut cookies = cookie::CookieJar::new();
        for header in request.headers().get_all(hyper::header::COOKIE) {
            if let Ok(cookie_set) = header.to_str() {
                for cookie_pair in cookie_set.split(";") {
                    let split_pair = cookie_pair.trim().split_once("=");
                    if let Some((name, value)) = split_pair {
                        let cookie = cookie::Cookie::build(
                            name.to_string(),
                            value.to_string(),
                        )
                        .finish();
                        cookies.add_original(cookie);
                    }
                }
            }
        }
        Self {
            request,
            response,
            cookies,
            address,
        }
    }
    pub fn done(mut self) -> hyper::Response<hyper::Body> {
        for delta in self.cookies.delta() {
            let delta_string = delta.to_string();
            if let Ok(value) =
                hyper::header::HeaderValue::from_str(delta_string.as_str())
            {
                self.response
                    .headers_mut()
                    .append(hyper::header::SET_COOKIE, value);
            }
        }
        self.response
    }
}
