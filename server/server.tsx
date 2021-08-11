
import { std, React, ReactDOMServer, Oak, denoflate } from "../deps.ts";

import { GraphQL } from "./graphql.ts";
import { Listener } from "./listener.ts";
import type { ListenOptions, ListenBaseOptions, ListenTlsOptions } from "./listener.ts";
import { Auth } from "./auth.ts";
import { Redis } from "./redis.ts";
import type { UserJWTBase } from "./auth.ts";
import { Console } from "./console.ts";

export { Console } from "./console.ts";
export { Redis } from "./redis.ts";
export { Auth } from "./auth.ts";
export { Util } from "./util.ts";

enum StatusCode
{
    success = 0,
    failure = 1,
}

/**
 * Parameters passed ot the server at creation time.
 */
export interface ServerAttributes
{
    /** Whether the server runs on HTTPS or HTTP. */
    secure: boolean;
    /** Outside-facing domain the server listens from. */
    domain: string | undefined;
    /** Local IP address the server listens on. */
    hostname: string;
    /** Port the server listens on for HTTP connections. */
    port: number;
    /** Pre-mapped REST routes. */
    routes: Record<string, string>;

    /** Port the server listens on for HTTPS connections. */
    portTls: number | undefined;
    /** Path to folder containing TLS certificates. */
    cert: string | undefined;

    /** React elements included in document head on SSR. */
    headElements: Array<React.ReactElement>;

    /** Enable React and Relay devtools (Electron). */
    devtools: boolean;
    /** Enable Redis database. */
    redis: boolean;

    /** Path to GraphQL schema. */
    schema: string;
    /** GraphQL resolvers object. */
    resolvers: unknown;
}

interface OakServer
{
    /** Oak application. */
    app: Oak.Application;
    /** Oak router. */
    router: Oak.Router;
}

/** 
 * HTTP/S server.
 */
export class Server<UserJWT extends UserJWTBase = never>
{
    /** Redis database connection. */
    public static redis: Redis = {} as Redis;

    private secure: boolean = {} as boolean;
    private domain: string = {} as string;
    private routes: Map<string, string> = new Map<string, string>();

    private readonly public: string = "/dist" as const;
    private scriptElements: Array<React.ReactElement> = [];

    private oak: OakServer = {} as OakServer;

    private listener: Listener = {} as Listener;
    private hostname: string = {} as string;
    private port: number = {} as number;
    private portTls: number | undefined;

    private closed: std.async.Deferred<StatusCode> = std.async.deferred();

    private graphql: GraphQL = {} as GraphQL;
    private auth: Auth<UserJWT> = {} as Auth<UserJWT>;

    private devtools: boolean = {} as boolean;

    private headElements: Array<React.ReactElement> = [];

    private constructor()
    {
        this.www = this.www.bind(this);

        this.static = this.static.bind(this);
        this.react = this.react.bind(this);

        this.get = this.get.bind(this);
        this.head = this.head.bind(this);

        this.handle = this.handle.bind(this);
        this.accept = this.accept.bind(this);

        this.compress = this.compress.bind(this);
        this.scripts = this.scripts.bind(this);

        this.serve = this.serve.bind(this);
        this.close = this.close.bind(this);
    }
    /**
     * Creates a new HTTP/S server.
     * 
     * @param attributes Options passed to server at creation time.
     */
    public static async create<UserJWT extends UserJWTBase = never>(attributes: ServerAttributes): Promise<Server<UserJWT>>
    {
        if (attributes.redis)
            Server.redis = await Redis.create({});

        const instance = new Server<UserJWT>();

        instance.secure = attributes.secure;

        instance.headElements = attributes.headElements;

        for (const key in attributes.routes)
        {
            const url = new URL(`key://${key}`);
            switch (url.pathname)
            {
                case "/graphql":
                    throw new Error("Cannot reroute /graphql URL");
                default:
                    instance.routes.set(key, attributes.routes[key]);
                    break;
            }
        }

        instance.hostname = attributes.hostname;
        instance.port = attributes.port;
        instance.portTls = instance.secure ? attributes.portTls : undefined;

        const options: Array<ListenOptions> = [];
        const listenOptions: ListenBaseOptions =
        {
            hostname: attributes.hostname,
            port: attributes.port as number,
            secure: false
        };
        options.push(listenOptions);

        if (instance.secure)
        {
            const listenTlsOptions: ListenTlsOptions =
            {
                hostname: attributes.hostname,
                port: attributes.portTls as number,
                certFile: std.path.join(attributes.cert ?? "", "fullchain.pem"),
                keyFile: std.path.join(attributes.cert ?? "", "privkey.pem"),
                alpnProtocols: ["http/1.1", "h2"],
                transport: "tcp",
                secure: true,
            };
            options.push(listenTlsOptions);
        }
        instance.listener = new Listener(options);

        instance.oak = { app: new Oak.Application(), router: new Oak.Router() };

        instance.graphql = await GraphQL.create(attributes);
        instance.auth = await Auth.create<UserJWT>({ redis: Server.redis });

        instance.devtools = attributes.devtools;

        if (attributes.domain)
        {
            if (!attributes.domain.startsWith("www."))
                instance.domain = `https://www.${attributes.domain}`;
            else
                instance.domain = `https://${attributes.domain}`;
        }
        else
            instance.domain = `https://${instance.hostname}:${instance.port}`;

        return await Promise.resolve(instance);
    }
    /** 
     * Whether the server is running on HTTP or HTTPS.
     */
    public get protocol(): "http" | "https"
    {
        return this.secure ? "https" : "http";
    }
    /** 
     * URL with port.
     */
    public get url(): string
    {
        return `${this.protocol}://${this.hostname}:${this.portTls ?? this.port}`;
    }
    /** 
     * URL without port.
     */
    public get urlSimple(): string
    {
        return `${this.protocol}://${this.hostname}`;
    }
    /** 
     * Generates middleware function for ensuring WWW URLs as canonical.
     * @return Middleware that routes non-WWW URLs to WWW URL.
     */
    private www(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            const host = context.request.headers.get("host") as string;
            if (!host.startsWith("www.") && !host.startsWith("localhost"))
            {
                const wwwhost = `www.${host}`;
                const protocol = context.request.secure ? "https" : "http";
                const redirect = `${protocol}://${wwwhost}${context.request.url.pathname}`;
                context.response.redirect(redirect);
            }
            await next();
        };
    }
    /**
     * Handles serving static content.
     * 
     * @param context Oak context object.
     */
    private async static(context: Oak.Context): Promise<void>
    {
        const filepath = context.request.url.pathname;
        const sendOptions: Oak.SendOptions =
        {
            gzip: true,
            hidden: true,
            maxbuffer: 0x400,
            root: std.path.join(".", this.public)
        };

        /* Google verification pages */
        const filename = std.path.basename(filepath);
        if (filename.startsWith("google") && filename.endsWith(".html"))
        {
            const textfile = std.path.join(".", this.public, `${filepath}.txt`);
            const body = await Deno.readTextFile(textfile);
            context.response.body = body;
            context.response.type = "text/plain";
            return;
        }

        await Oak.send(context, filepath, sendOptions);
    }
    /**
     * Handles serving React pages.
     * 
     * @param context Oak context object.
     */
    private async react(context: Oak.Context): Promise<void>
    {
        context.response.type = "text/html";

        const staticContext: Record<string, unknown> = {};

        const element: React.ReactElement =
            <html lang="en">
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta httpEquiv="Content-Security-Policy" />
                    <meta charSet="UTF-8" />
                    {this.scriptElements}
                    <link rel="icon" href="/favicon.ico" />
                    <link rel="stylesheet" href="/index.css" />
                    <link rel="stylesheet" href="/nprogress.css" />
                    {this.headElements}
                </head>
                <body>
                    <div id="root"></div>
                </body>
            </html>;

        const render = await Promise.resolve(ReactDOMServer.renderToString(element));
        const body = `<!DOCTYPE html> ${render}`;

        if (staticContext.url)
        {
            context.response.redirect(staticContext.url as string);
            return;
        }

        context.response.status = staticContext.statusCode as Oak.Status ?? Oak.Status.OK;
        context.response.body = body;
    }
    /**
     * Handles GET requests to all URLs except JWT and GraphQL endpoints.
     * 
     * @return Middleware for handling GET requests.
     */
    private get(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            /* Redirect HTTP to HTTPS if it's available. */
            if (!context.request.secure && this.secure)
            {
                if (context.request.headers.has("x-http-only"))
                {
                    context.response.status = Oak.Status.OK;
                    context.response.body = "";
                    return;
                }
                const urlRequest = context.request.url;
                const host = context.request.headers.get("host");
                return context.response.redirect(`https://${host}${urlRequest.pathname}`);
            }

            /* Check reroutes */
            if (this.routes.has(context.request.url.pathname))
            {
                const from = context.request.url.pathname;
                const to = this.routes.get(from) as string;
                return context.response.redirect(to);
            }

            /* Convert URL to filepath. */
            const filepath = std.path.join(".", this.public, context.request.url.pathname);

            /* File path not found or is not a file -> not static. */
            if (!await std.fs.exists(filepath) || !(await Deno.stat(filepath)).isFile)
                return await this.react(context);

            await this.static(context);
            await next();
        };
    }
    /**
     * Handles HEAD requests to all URLs except JWT and GraphQL endpoints.
     * 
     * @return Middleware for handling HEAD requests.
     */
    private head(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            await this.get()(context, async () => { });
            const response = await context.response.toDomResponse();
            const length = response.headers.get("content-length");
            context.response.headers.set("content-length", length ?? "0");
            context.response.body = undefined;
            await next();
        };
    }
    /**
     * Handles a single Deno connection.
     * 
     * @param connection Incoming connection.
     * @param secure Whether the connection is encrpted or not.
     */
    private async handle(connection: Deno.Conn, secure: boolean): Promise<void>
    {
        try
        {
            const httpConnection = Deno.serveHttp(connection);
            for await (const event of httpConnection)
            {
                try
                {
                    const request = event.request;
                    const response = await this.oak.app.handle(request, connection, secure);
                    if (response) await event.respondWith(response);
                }
                catch { undefined; }
            }
            try { httpConnection.close(); }
            catch { undefined; }
            try { connection.close(); }
            catch { undefined; }
        }
        catch { undefined; }
    }
    /**
     * Handles connection stream for one listener RID.
     * 
     * @param connection Listener RID.
     * @return Whether handling the connection stream succeded or failed.
     */
    private async accept(key: number): Promise<StatusCode>
    {
        const secure = this.listener.secure(key);
        for await (const connection of this.listener.connections(key))
        {
            try { this.handle(connection, secure); }
            catch { undefined; }
        }
        return StatusCode.failure;
    }
    /**
     * Compresses static content using GZip.
     */
    public async compress(): Promise<void>
    {
        const ext = [".js", ".map", ".txt", ".css"];
        const folder = std.path.join(".", this.public, "**", "*");
        for await (const file of std.fs.expandGlob(folder))
        {
            if ((await Deno.stat(file.path)).isFile && ext.includes(std.path.extname(file.path)))
            {
                const gunzipped = await Deno.readFile(file.path);
                const gzipped = denoflate.gzip(gunzipped, undefined);
                await Deno.writeFile(`${file.path}.gz`, gzipped);
            }
        }
    }
    /**
     * Loads Webpack scripts into React SSR.
     */
    private async scripts(): Promise<void>
    {
        if (this.devtools)
        {
            this.scriptElements.push(<script src="http://localhost:8097"></script>);
            this.scriptElements.push(<script src="http://localhost:9097"></script>);
        }
        const folder = std.path.join(".", this.public, "scripts", "webpack", "*.js");
        for await (const file of std.fs.expandGlob(folder))
        {
            const basename = std.path.basename(file.path);
            const [name, id, _] = basename.split(".", 3);
            if (name !== id)
                this.scriptElements.push(<script src={`/scripts/webpack/${basename}`} defer></script>);
        }
    }
    /**
     * Starts server.
     */
    public async serve(): Promise<never>
    {
        Console.log(`${std.colors.bold("https")}${std.colors.reset("aurus")}`);
        Console.log(`Building GraphQL...`);
        await this.graphql.build({ url: this.domain });
        Console.success(`GraphQL built`, { clear: true });

        Console.log(`Compressing static files...`, { clear: true });
        await this.compress();
        Console.success(`Static files compressed`, { clear: true });

        Console.log(`Collecting scripts...`, { clear: true });
        await this.scripts();
        Console.success(`Scripts collected`, { clear: true });

        this.oak.router.head("/graphql", this.graphql.head());
        this.oak.router.get("/graphql", this.graphql.get());
        this.oak.router.post("/graphql", this.graphql.post());

        this.oak.router.post("/jwt/refresh", this.auth.post());

        this.oak.router.head("/((?!graphql|jwt).*)", this.head());
        this.oak.router.get("/((?!graphql|jwt).*)", this.get());

        this.oak.app.proxy = true;
        this.oak.app.use(this.www());
        this.oak.app.use(this.oak.router.routes());
        this.oak.app.use(this.oak.router.allowedMethods());
        this.oak.app.use(Oak.etag.factory());

        const linkString = function (link: string)
        {
            return std.colors.underline(std.colors.magenta(link));
        };

        while (true)
        {
            try
            {
                this.listener.listen();
                const keys = this.listener.keys();
                const promises = keys.map(this.accept);
                promises.push(this.closed);
                Console.log(`Server is running on ${linkString(this.url)}`, { clear: true });
                const status = await Promise.race(promises);
                Console.warn(`Restarting (status: ${status})`, { time: true, clear: true });
                this.close();
                this.closed = std.async.deferred();
            }
            catch (error)
            {
                Console.warn(`Restarting due to error ${Deno.inspect(error)}`, { time: true });
                this.close();
                this.closed = std.async.deferred();
            }
        }
    }
    /**
     * Stops server.
     */
    public close(): void
    {
        this.listener.close();
        this.closed.resolve(StatusCode.success);
    }
}
