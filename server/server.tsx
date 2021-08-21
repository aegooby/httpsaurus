
import { std, React, ReactDOMServer, Oak, denoflate } from "../deps.ts";

import { GraphQL } from "./graphql.ts";
import { Auth } from "./auth.ts";
import { Console } from "./console.ts";
import { Util } from "./util.ts";
import type { UserJWTBase } from "./auth.ts";

export { Auth } from "./auth.ts";
export { Console } from "./console.ts";
export { Redis } from "./redis.ts";
export { Util } from "./util.ts";

/**
 * Parameters passed ot the server at creation time.
 */
export interface ServerAttributes
{
    /** Whether the server runs on HTTPS or HTTP. */
    secure: boolean;
    /** Outside-facing domain the server listens from. */
    domain: string;
    /** Local IP address the server listens on. */
    hostname: string;
    /** Port the server listens on for HTTP connections. */
    port: number;
    /** Whether the server is running through a port proxy. */
    proxy: boolean;
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

    /** Path to GraphQL schema. */
    schema: string;
    /** GraphQL resolvers object. */
    resolvers: unknown;
}

interface OakServer
{
    /** Oak application. */
    app: Oak.Application;
    /** Oak listen options for HTTP. */
    listenOptionsBase: Oak.ListenOptionsBase;
    /** Oak listen options for HTTPS. */
    listenOptionsTls: Oak.ListenOptionsTls;
    /** Oak router. */
    router: Oak.Router;
}

/** 
 * HTTP/S server.
 */
export class Server<UserJWT extends UserJWTBase = never>
{
    private secure: boolean = {} as boolean;
    private domain: string = {} as string;
    private hostname: string = {} as string;
    private port: number = {} as number;
    private proxy: boolean = {} as boolean;
    private routes: Map<string, string> = new Map<string, string>();

    private portTls: number | undefined;

    private headElements: Array<React.ReactElement> = [];

    private devtools: boolean = {} as boolean;


    private readonly public: string = "/dist" as const;
    private scriptElements: Array<React.ReactElement> = [];

    private abortController: AbortController = {} as AbortController;

    private oak: OakServer = {} as OakServer;
    private graphql: GraphQL = {} as GraphQL;
    private auth: Auth<UserJWT> = {} as Auth<UserJWT>;

    private constructor() { Util.bind(this); }
    /**
     * Creates a new HTTP/S server.
     * 
     * @param attributes Options passed to server at creation time.
     */
    public static async create<UserJWT extends UserJWTBase = never>(attributes:
        ServerAttributes): Promise<Server<UserJWT>>
    {
        const instance = new Server<UserJWT>();

        instance.secure = attributes.secure;
        instance.hostname = attributes.hostname;
        instance.port = attributes.port;
        instance.proxy = attributes.proxy;
        instance.portTls = instance.secure ? attributes.portTls : undefined;

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

        instance.abortController = new AbortController();
        const applicationOptions =
        {
            proxy: true,
            serverConstructor: Oak.HttpServerNative
        };
        instance.oak =
        {
            app: new Oak.Application(applicationOptions),
            listenOptionsBase:
            {
                hostname: attributes.hostname,
                port: attributes.port,
                signal: instance.abortController.signal,
                secure: false
            },
            listenOptionsTls:
            {
                hostname: attributes.hostname,
                port: attributes.portTls ?? 0,
                certFile: std.path.join(attributes.cert ?? "", "fullchain.pem"),
                keyFile: std.path.join(attributes.cert ?? "", "privkey.pem"),
                alpnProtocols: ["http/1.1", "h2"],
                transport: "tcp",
                signal: instance.abortController.signal,
                secure: true
            },
            router: new Oak.Router()
        };

        instance.graphql = await GraphQL.create(attributes);
        instance.auth = await Auth.create<UserJWT>();

        instance.devtools = attributes.devtools;

        if (!attributes.domain.startsWith("www.") &&
            !Util.equal(attributes.domain, "localhost"))
        { instance.domain = `www.${attributes.domain}`; }
        else
            instance.domain = attributes.domain;

        return await Promise.resolve(instance);
    }
    /** 
     * Protocol that the server is running is on.
     */
    public get protocol(): string
    {
        return this.secure ? "https" : "http";
    }
    /** 
     * Public-facing URL of the server.
     */
    public get url(): string
    {
        const port = this.secure ? this.portTls as number : this.port;
        if (this.proxy)
            return `${this.protocol}://${this.domain}`;
        else
            return `${this.protocol}://${this.hostname}:${port}`;
    }
    private tls(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            /* Redirect HTTP to HTTPS if it's available. */
            if (this.secure && !context.request.secure)
            {
                if (context.request.headers.has("x-http-only"))
                {
                    context.response.status = Oak.Status.OK;
                    context.response.body = "";
                    await next();
                    return;
                }
                if (!context.request.headers.has("host"))
                {
                    context.response.status = Oak.Status.BadRequest;
                    await next();
                    return;
                }
                const urlRequest = context.request.url;
                const host = context.request.headers.get("host") as string;
                const redirect = new URL(urlRequest.pathname, `https://${host}`);
                if (!this.proxy)
                    redirect.port = (this.portTls as number).toString();
                return context.response.redirect(redirect);
            }
            await next();
        };
    }
    /** 
     * Generates middleware function for ensuring WWW URLs as canonical.
     * @return Middleware that routes non-WWW URLs to WWW URL.
     */
    private www(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            if (!context.request.headers.has("host"))
            {
                context.response.status = Oak.Status.BadRequest;
                await next();
                return;
            }
            const host = context.request.headers.get("host") as string;
            if (!host.startsWith("www.") && !host.startsWith("localhost"))
            {
                const wwwhost = `www.${host}`;
                const protocol = context.request.secure ? "https" : "http";
                const redirect =
                    `${protocol}://${wwwhost}${context.request.url.pathname}`;
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
            const textfile =
                std.path.join(".", this.public, `${filepath}.txt`);
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
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
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

        context.response.status =
            staticContext.statusCode as Oak.Status ?? Oak.Status.OK;
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
            /* Check reroutes */
            if (this.routes.has(context.request.url.pathname))
            {
                const from = context.request.url.pathname;
                const to = this.routes.get(from) as string;
                return context.response.redirect(to);
            }

            /* Convert URL to filepath. */
            const filepath =
                std.path.join(".", this.public, context.request.url.pathname);

            /* File path not found or is not a file -> not static. */
            if (!await std.fs.exists(filepath) ||
                !(await Deno.stat(filepath)).isFile)
            { return await this.react(context); }

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
     * Compresses static content using GZip.
     */
    public async compress(): Promise<void>
    {
        const ext = [".js", ".map", ".txt", ".css"];
        const folder = std.path.join(".", this.public, "**", "*");
        for await (const file of std.fs.expandGlob(folder))
        {
            if ((await Deno.stat(file.path)).isFile &&
                ext.includes(std.path.extname(file.path)))
            {
                const gunzipped = await Deno.readFile(file.path);
                const gzipped = denoflate.gzip(gunzipped, undefined);
                await Deno.writeFile(`${file.path}.gz`, gzipped);
            }
        }
    }
    /**
     * Loads scripts into React SSR.
     */
    private async scripts(): Promise<void>
    {
        if (this.devtools)
        {
            const reactDevtools =
                <script src="http://localhost:8097" async></script>;
            const relayDevtools =
                <script src="http://localhost:9097" async></script>;
            this.scriptElements.push(reactDevtools);
            this.scriptElements.push(relayDevtools);
        }
        const entrypointPath =
            std.path.join(".", this.public, "/scripts/bundle.js");
        if (!await std.fs.exists(entrypointPath))
            throw new Error("Main entrypoint \"/scripts/bundle.js\" not found");

        const entrypoint =
            <script src="/scripts/bundle.js" type="module" defer></script>;
        this.scriptElements.push(entrypoint);
    }
    /**
     * Starts server.
     */
    public async serve(): Promise<void>
    {
        Console.log(`${std.colors.bold("https")}${std.colors.reset("aurus")}`);
        Console.log("Building GraphQL...");
        await this.graphql.build({ url: this.url });
        Console.success("GraphQL built");

        Console.log("Compressing static files...");
        await this.compress();
        Console.success("Static files compressed");

        Console.log("Collecting scripts...");
        await this.scripts();
        Console.success("Scripts collected");

        this.oak.router.head("/graphql", this.graphql.head());
        this.oak.router.get("/graphql", this.graphql.get());
        this.oak.router.post("/graphql", this.graphql.post());

        this.oak.router.post("/jwt/refresh", this.auth.post());

        this.oak.router.head("/((?!graphql|jwt).*)", this.head());
        this.oak.router.get("/((?!graphql|jwt).*)", this.get());

        this.oak.app.proxy = true;
        this.oak.app.use(this.tls());
        this.oak.app.use(this.www());
        this.oak.app.use(this.oak.router.routes());
        this.oak.app.use(this.oak.router.allowedMethods());
        this.oak.app.use(Oak.etag.factory());

        const url = std.colors.underline(std.colors.magenta(this.url));
        Console.log(`Server is running on ${url}`);

        const logOakErrors = function (event: Event)
        {
            Console.error((event as unknown as Record<string, unknown>).error);
        };
        this.oak.app.addEventListener("error", logOakErrors);

        const promises = [] as Promise<void>[];
        promises.push(this.oak.app.listen(this.oak.listenOptionsBase));
        if (this.secure)
            promises.push(this.oak.app.listen(this.oak.listenOptionsTls));

        await Promise.all(promises);
    }
    /**
     * Stops server.
     */
    public close(): void
    {
        this.abortController.abort();
    }
}
