use super::handler;

#[derive(Clone, Copy, Debug)]
pub struct Context {}
impl Context {
    pub fn new() -> Context {
        Context {}
    }
}

async fn abort_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install Ctrl + C signal handler");
}

pub struct Server {
    context: Context,
}
impl Server {
    pub fn new(context: Context) -> Server {
        Server { context }
    }
    pub async fn serve(&self) {
        let make_service_fn = move |conn: &hyper::server::conn::AddrStream| {
            let context = self.context.clone();
            let addr = conn.remote_addr();
            let service_fn =
                move |request| handler::handle(request, context.clone(), addr);
            let service = hyper::service::service_fn(service_fn);

            async move { Ok::<_, std::convert::Infallible>(service) }
        };

        let make_service = hyper::service::make_service_fn(make_service_fn);
        let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3080));
        let future = hyper::Server::bind(&addr)
            .serve(make_service)
            .with_graceful_shutdown(abort_signal());
        if let Err(error) = future.await {
            eprintln!("Failed to start server: {}", error);
        }
    }
}
