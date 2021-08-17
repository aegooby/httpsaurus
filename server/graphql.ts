
import { Oak, Apollo, graphql, Relay as _Relay, playground, std } from "../deps.ts";

import { Console } from "./console.ts";
import { Util } from "./util.ts";


interface GraphQLQuery
{
    query: string;
    operationName?: string | undefined;
    variables?: Record<string, unknown> | undefined;
}

interface GraphQLAttributes
{
    schema: string;
    resolvers: unknown;
    secure: boolean;
    port: number;
    portTls: number | undefined;
}
interface GraphQLBuildAttributes
{
    url: string;
}

export class GraphQL
{
    private schema: string = {} as string;
    private resolverSchema: graphql.GraphQLSchema = {} as graphql.GraphQLSchema;
    private resolvers: Apollo.GraphQLResolverMap = {};
    private playground: std.async.Deferred<string> = std.async.deferred();
    private secure: boolean = {} as boolean;
    private port: number = {} as number;
    private portTls: number | undefined = undefined;

    private constructor() { Util.bind(this); }
    public static async create(attributes: GraphQLAttributes): Promise<GraphQL>
    {
        const instance = new GraphQL();

        instance.schema = attributes.schema;
        instance.resolvers = attributes.resolvers as Apollo.GraphQLResolverMap;
        instance.secure = attributes.secure;
        instance.port = attributes.port;
        instance.portTls = attributes.portTls;

        return await Promise.resolve(instance);
    }
    private async buildSchema(): Promise<void>
    {
        const schema = await Deno.readTextFile(this.schema);
        this.resolverSchema = graphql.buildSchema(schema);
        Apollo.addResolversToSchema(this.resolverSchema, this.resolvers);
    }
    private urlPlayground(url: string): string
    {
        const urlParsed = new URL(url);
        switch (urlParsed.hostname)
        {
            case "localhost":
                return this.secure ?
                    `https://localhost:${this.portTls}` :
                    `http://localhost:${this.port}`;
            default:
                return url;
        }
    }
    private renderPlayground(url: string): void
    {
        const urlPlayground = this.urlPlayground(url);
        const playgroundOptions: playground.RenderPageOptions =
        {
            endpoint: urlPlayground + "/graphql",
            subscriptionEndpoint: urlPlayground,
            settings:
            {
                "editor.cursorShape": "line",
                "editor.fontSize": 18,
                "editor.fontFamily": "'Menlo', monospace",
                "editor.reuseHeaders": true,
                "editor.theme": "dark",
                "general.betaUpdates": true,
                "request.credentials": "include",
                "request.globalHeaders": {},
                "schema.polling.enable": true,
                "schema.polling.endpointFilter": "*localhost",
                "schema.polling.interval": 2000,
                "tracing.hideTracingResponse": true,
                "tracing.tracingSupported": true,
            }
        };
        this.playground.resolve(playground.renderPlaygroundPage(playgroundOptions));
    }
    public async build(attributes: GraphQLBuildAttributes)
    {
        await this.buildSchema();
        this.renderPlayground(attributes.url);
    }
    public post(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            try
            {
                const query: GraphQLQuery = { query: "" };
                switch (context.request.headers.get("content-type"))
                {
                    case "application/json":
                        {
                            const jsonRequest = await context.request.body({ type: "json" }).value;
                            query.query = jsonRequest.query;
                            query.operationName = jsonRequest.operationName;
                            query.variables = jsonRequest.variables;
                            break;
                        }
                    case "application/graphql":
                        {
                            const textRequest = await context.request.body({ type: "text" }).value;
                            query.query = textRequest;
                            break;
                        }
                    default:
                        throw new Error("Invalid GraphQL MIME type");
                }
                const graphQLArgs: graphql.GraphQLArgs =
                {
                    schema: this.resolverSchema,
                    source: query.query,
                    rootValue: this.resolvers,
                    contextValue: context,
                    variableValues: query.variables,
                    operationName: query.operationName,
                };
                const result = await graphql.graphql(graphQLArgs);
                switch (context.response.status)
                {
                    case Oak.Status.NotFound:
                        context.response.status = Oak.Status.OK;
                        break;
                    default:
                        break;
                }
                context.response.body = JSON.stringify(result);
            }
            catch (error)
            {
                if (!(error instanceof Deno.errors.Http))
                    Console.warn(error);
                const jsonError =
                {
                    data: null,
                    errors: [{ message: error.message ?? error }],
                };
                context.response.status = Oak.Status.InternalServerError;
                context.response.body = JSON.stringify(jsonError);
            }
            await next();
        };
    }
    public get(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            context.response.status = Oak.Status.OK;
            context.response.body = await this.playground;
            await next();
        };
    }
    public head(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            await this.get()(context, async () => { });
            context.response.status = Oak.Status.MethodNotAllowed;
            context.response.body = undefined;
            await next();
        };
    }
}
