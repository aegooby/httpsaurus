use super::handler;

#[derive(Clone, Copy, Debug)]
pub struct Context {}
impl Context {
    pub fn new() -> Context {
        Context {}
    }
}

pub struct Server {
    context: Context,
    active: bool,
}
impl Server {
    pub fn new(context: Context) -> Server {
        Server {
            context,
            active: false,
        }
    }
    async fn abort_signal(&mut self) {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl + C signal handler")
    }
    pub async fn serve(&mut self) {
        /* Prevent the server from serving twice. */
        if self.active {
            return;
        }
        self.active = true;

        let context = self.context.clone();
        let make_service_fn = move |conn: &hyper::server::conn::AddrStream| {
            let context = context.clone();
            let address = conn.remote_addr();
            let service_fn = move |request| {
                handler::handle(request, address, context.clone())
            };
            let service = hyper::service::service_fn(service_fn);

            async move { Ok::<_, std::convert::Infallible>(service) }
        };

        let make_service = hyper::service::make_service_fn(make_service_fn);
        let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3080));
        let future = hyper::Server::bind(&addr)
            .serve(make_service)
            .with_graceful_shutdown(self.abort_signal());
        if let Err(error) = future.await {
            eprintln!("Failed to start server: {}", error);
        }

        /* Server is done serving. */
        self.active = false;
    }
}
