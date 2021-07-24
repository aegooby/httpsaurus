
import * as async from "@std/async";

import * as Oak from "oak";
import * as Apollo from "apollo-graphql";
import * as graphql from "graphql";
import * as playground from "graphql-playground";

import { Console } from "./console.tsx";
import type { State } from "./server.tsx";
import type { Query } from "../components/Core/GraphQL/GraphQL.tsx";

interface GraphQLAttributes
{
    schema: string;
    resolvers: unknown;
    secure: boolean;
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
    private playground: async.Deferred<string> = async.deferred();
    private secure: boolean = {} as boolean;

    private constructor()
    {
        this.buildSchema = this.buildSchema.bind(this);
        this.urlPlayground = this.urlPlayground.bind(this);
        this.renderPlayground = this.renderPlayground.bind(this);
        this.build = this.build.bind(this);

        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.head = this.head.bind(this);
    }
    public static async create(attributes: GraphQLAttributes): Promise<GraphQL>
    {
        const instance = new GraphQL();

        instance.schema = attributes.schema;
        instance.resolvers = attributes.resolvers as Apollo.GraphQLResolverMap;
        instance.secure = attributes.secure;

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
                return this.secure ? "https://localhost:3443" : "http://localhost:3080";
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
    public post(): Oak.Middleware<State>
    {
        return async (context: Oak.Context<State>, next: () => Promise<unknown>) =>
        {
            try
            {
                const query: Query = { query: "" };
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
                context.response.status = Oak.Status.OK;
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
                context.response.status = Oak.Status.OK;
                context.response.body = JSON.stringify(jsonError);
            }
            await next();
        };
    }
    public get(): Oak.Middleware<State>
    {
        return async (context: Oak.Context<State>, next: () => Promise<unknown>) =>
        {
            context.response.status = Oak.Status.OK;
            context.response.body = await this.playground;
            await next();
        };
    }
    public head(): Oak.Middleware<State>
    {
        return async (context: Oak.Context<State>, next: () => Promise<unknown>) =>
        {
            await this.get()(context, async () => { });
            context.response.status = Oak.Status.MethodNotAllowed;
            context.response.body = undefined;
            await next();
        };
    }
}
