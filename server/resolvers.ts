
import { std, Oak, scrypt, graphql } from "../deps.ts";

import { Auth, Server } from "./server.tsx";
import type { Resolvers as GraphQLResolvers, QueryResolvers, MutationResolvers } from "../graphql/types.ts";
import type { User, UserJwt, UserPayload } from "../graphql/types.ts";

const encoder = new TextEncoder();

type Context = Oak.Context;

class Query implements QueryResolvers<Context>
{
    private constructor() 
    {
        this.readUser = this.readUser.bind(this);
        this.readCurrentUser = this.readCurrentUser.bind(this);
    }
    public static create(): Query
    {
        const instance = new Query();
        return instance;
    }
    @Auth.authenticated<UserJwt, { email: string; }>(function (payload, args) { return payload.email === args.email; })
    async readUser(_parent: unknown, args: { email: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Server.redis.search.search("users", `@email:{${escapedEmail}}`);
        switch (typeof search)
        {
            case "number":
                throw new Error(`No user found with email ${args.email}`);
            default:
                break;
        }
        if (search.at(0) as number > 1 || search.length > 3)
            throw new Error(`More than one user found with email ${args.email}`);
        const parsedSearch = search as [1, string, ["$", string]];
        const user: User = JSON.parse((parsedSearch.at(2) as ["$", string]).at(1) as string);
        return user;
    }
    @Auth.authenticated<UserJwt>()
    async readCurrentUser(_parent: unknown, _args: unknown, context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const jwtPayload = context.state.payload;
        const result = JSON.parse(await Server.redis.json.get(`nodes:users:${jwtPayload.id}`, "$"));
        if (!result)
            throw new Error(`No JSON data returned for user with id ${jwtPayload.id}`);
        const user: UserPayload | undefined =
            (result as unknown[]).pop() as (UserPayload | undefined);
        if (!user)
            throw new Error(`No user found with id ${jwtPayload.id}`);
        return user;
    }
}

class Mutation implements MutationResolvers<Context>
{
    private constructor()
    {
        this.createUser = this.createUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.revokeUser = this.revokeUser.bind(this);
    }
    public static create(): MutationResolvers<Context>
    {
        const instance = new Mutation();
        return instance;
    }
    @Auth.rateLimit()
    async createUser(_parent: unknown, args: { email: string; password: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const id = await std.uuid.v5.generate(std.uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));

        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Server.redis.search.search("users", `@email:{${escapedEmail}}`);

        switch (typeof search)
        {
            case "number":
                break;
            default:
                throw new Error(`Email address ${args.email} already in use`);
        }
        const password = await scrypt.hash(args.password);
        const payload: UserPayload =
        {
            id: id,
            email: args.email,
            password: password,
            receipt: null
        };
        await Server.redis.json.set(`nodes:users:${id}`, "$", JSON.stringify(payload));
        const user: User = { ...payload };
        return user;
    }
    async loginUser(_parent: unknown, args: { email: string; password: string; }, context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Server.redis.search.search("users", `@email:{${escapedEmail}}`);
        switch (typeof search)
        {
            case "number":
                throw new Error(`User with email ${args.email} does not exist`);
            default:
                break;
        }
        if (search.at(0) as number > 1 || search.length > 3)
            throw new Error(`More than one user found with email ${args.email}`);
        const parsedSearch = search as [1, string, ["$", string]];
        const userInfo: UserPayload = JSON.parse((parsedSearch.at(2) as ["$", string]).at(1) as string);
        if (!await scrypt.verify(args.password, userInfo.password))
            throw new Error(`Incorrect password for user with email ${args.email}`);

        const user: User = { ...userInfo };

        Auth.refresh.create<UserJwt>(user, context);

        return Auth.access.create<UserJwt>(user);
    }
    logoutUser(_parent: unknown, _args: unknown, context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        Auth.refresh.reset(context);
        return true;
    }
    async revokeUser(_parent: unknown, args: { id: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const receipt = await std.uuid.v5.generate(std.uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));
        await Server.redis.json.set(`nodes:users:${args.id}`, "$.receipt", `"${receipt}"`);
        return true;
    }
}

export class Resolvers
{
    private constructor() { }
    public static create(): GraphQLResolvers<Context>
    {
        const resolvers: GraphQLResolvers<Context> =
        {
            Query: Query.create(),
            Mutation: Mutation.create()
        };
        return resolvers;
    }
}