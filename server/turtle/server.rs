use super::auth;
use super::handler;
use super::redis;

#[derive(Clone, Debug)]
pub struct Context {
    pub auth: auth::AuthContext,
    pub redis: redis::RedisContext,
}
impl Context {
    pub fn new() -> Context {
        Context {
            auth: auth::AuthContext::new(),
            redis: redis::RedisContext::new(None),
        }
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
