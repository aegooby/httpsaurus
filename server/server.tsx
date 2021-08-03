
import * as path from "@std/path";
import * as fs from "@std/fs";
import * as colors from "@std/colors";
import * as async from "@std/async";

import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as Oak from "oak";
import * as denoflate from "denoflate";

import { GraphQL } from "./graphql.tsx";
import { Listener } from "./listener.tsx";
import type { ListenOptions, ListenBaseOptions, ListenTlsOptions } from "./listener.tsx";
import { Auth } from "./auth.tsx";
import { Redis } from "./redis.tsx";
import type { UserJWTBase } from "./auth.tsx";
import { Console } from "./console.tsx";

export { Console } from "./console.tsx";
export { Redis } from "./redis.tsx";
export { Auth } from "./auth.tsx";

class Version
{
    public major: number;
    public minor: number;
    public patch: number;

    constructor(major: number, minor: number, patch: number)
    {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }
    public string()
    {
        return `v${this.major}.${this.minor}.${this.patch}`;
    }
}
export const version: Version = new Version(2, 1, 0);

enum StatusCode
{
    success = 0,
    failure = 1,
}

export interface ServerAttributes
{
    secure: boolean;
    domain: string | undefined;
    hostname: string;
    port: number;
    routes: Record<string, string>;

    portTls: number | undefined;
    cert: string | undefined;

    headElements: Array<React.ReactElement>;

    redis: Redis;

    devtools: boolean;

    schema: string;
    resolvers: unknown;
}

interface OakServer
{
    app: Oak.Application;
    router: Oak.Router;
}

export class Server<UserJWT extends UserJWTBase>
{
    private secure: boolean = {} as boolean;
    private domain: string = {} as string;
    private routes: Map<string, string> = new Map<string, string>();

    private public: string = "/dist" as const;
    private scriptElements: Array<React.ReactElement> = [];

    private oak: OakServer = {} as OakServer;

    private listener: Listener = {} as Listener;
    private hostname: string = {} as string;
    private port: number = {} as number;
    private portTls: number | undefined;

    private closed: async.Deferred<StatusCode> = async.deferred();

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
    public static async create<UserJWT extends UserJWTBase>(attributes: ServerAttributes): Promise<Server<UserJWT>>
    {
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
                certFile: path.join(attributes.cert ?? "", "fullchain.pem"),
                keyFile: path.join(attributes.cert ?? "", "privkey.pem"),
                alpnProtocols: ["http/1.1", "h2"],
                transport: "tcp",
                secure: true,
            };
            options.push(listenTlsOptions);
        }
        instance.listener = new Listener(options);

        instance.oak = { app: new Oak.Application(), router: new Oak.Router() };

        instance.graphql = await GraphQL.create(attributes);
        instance.auth = await Auth.create<UserJWT>(attributes);

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
    public get protocol(): "http" | "https"
    {
        return this.secure ? "https" : "http";
    }
    public get url(): string
    {
        return `${this.protocol}://${this.hostname}:${this.portTls ?? this.port}`;
    }
    public get urlSimple(): string
    {
        return `${this.protocol}://${this.hostname}`;
    }
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
    private async static(context: Oak.Context): Promise<void>
    {
        const filepath = context.request.url.pathname;
        const sendOptions: Oak.SendOptions =
        {
            gzip: true,
            hidden: true,
            maxbuffer: 0x400,
            root: path.join(".", this.public)
        };

        /* Google verification pages */
        const filename = path.basename(filepath);
        if (filename.startsWith("google") && filename.endsWith(".html"))
        {
            const body = await Deno.readTextFile(path.join(".", this.public, `${filepath}.txt`));
            context.response.body = body;
            context.response.type = "text/plain";
            return;
        }

        await Oak.send(context, filepath, sendOptions);
    }
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
            const filepath = path.join(".", this.public, context.request.url.pathname);

            /* File path not found or is not a file -> not static. */
            if (!await fs.exists(filepath) || !(await Deno.stat(filepath)).isFile)
                return await this.react(context);

            await this.static(context);
            await next();
        };
    }
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
    private async compress(): Promise<void>
    {
        const ext = [".js", ".map", ".txt", ".css"];
        const folder = path.join(".", this.public, "**", "*");
        for await (const file of fs.expandGlob(folder))
        {
            if ((await Deno.stat(file.path)).isFile && ext.includes(path.extname(file.path)))
            {
                const gunzipped = await Deno.readFile(file.path);
                const gzipped = denoflate.gzip(gunzipped, undefined);
                await Deno.writeFile(`${file.path}.gz`, gzipped);
            }
        }
    }
    private async scripts(): Promise<void>
    {
        if (this.devtools)
        {
            this.scriptElements.push(<script src="http://localhost:8097"></script>);
            this.scriptElements.push(<script src="http://localhost:9097"></script>);
        }
        const folder = path.join(".", this.public, "scripts", "webpack", "*.js");
        for await (const file of fs.expandGlob(folder))
        {
            const basename = path.basename(file.path);
            const [name, id, _] = basename.split(".", 3);
            if (name !== id)
                this.scriptElements.push(<script src={`/scripts/webpack/${basename}`} defer></script>);
        }
    }
    public async serve(): Promise<never>
    {
        Console.log(`${colors.bold("https")}${colors.reset("aurus")} ${version.string()}`);
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
            return colors.underline(colors.magenta(link));
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
                this.closed = async.deferred();
            }
            catch (error)
            {
                Console.warn(`Restarting due to error ${Deno.inspect(error)}`, { time: true });
                this.close();
                this.closed = async.deferred();
            }
        }
    }
    public close(): void
    {
        this.listener.close();
        this.closed.resolve(StatusCode.success);
    }
}
