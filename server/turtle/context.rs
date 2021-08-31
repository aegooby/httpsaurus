pub struct Context {
    request: hyper::Request<hyper::Body>,
    response: hyper::Response<hyper::Body>,
    cookies: cookie::CookieJar,
}
impl Context {
    fn new(
        request: hyper::Request<hyper::Body>,
        response: hyper::Response<hyper::Body>,
    ) -> Context {
        Context {
            request,
            response,
            cookies: cookie::CookieJar::new(),
        }
    }
}
