use crate::core::{context, handler};

type Address = [u8; 4];

pub struct Server {
    context: context::Context,
    active: bool,
    hostname: Address,
}
impl Server {
    pub fn new(context: context::Context, hostname: Address) -> Self {
        Self {
            context,
            active: false,
            hostname,
        }
    }
    async fn abort_signal() {
        match tokio::signal::ctrl_c().await {
            Ok(()) => (),
            Err(error) => {
                eprintln!("Failed to listen for CTRL-C: {}", error)
            }
        }
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
            let service_fn = move |request| handler::handle(request, address, context.clone());
            let service = hyper::service::service_fn(service_fn);

            async move { Ok::<_, std::convert::Infallible>(service) }
        };

        let make_service = hyper::service::make_service_fn(make_service_fn);
        let addr = std::net::SocketAddr::from((self.hostname, 3080));
        let future = hyper::Server::bind(&addr)
            .serve(make_service)
            .with_graceful_shutdown(Self::abort_signal());
        crate::console_log!(
            "Server is running on {}",
            "http://localhost:3080".magenta().underline()
        );
        if let Err(error) = future.await {
            crate::console_error!("Failed to start server: {}", error);
        }

        /* Server is done serving. */
        self.active = false;
    }
}
