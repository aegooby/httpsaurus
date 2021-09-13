#[derive(Debug)]
pub struct Message {
    pub request: std::sync::Arc<hyper::Request<hyper::Body>>,
    pub response: std::sync::Arc<hyper::Response<hyper::Body>>,
    pub cookies: cookie::CookieJar,
    pub address: std::net::SocketAddr,
}

impl Message {
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
