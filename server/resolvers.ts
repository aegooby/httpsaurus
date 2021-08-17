
import { Oak, scrypt, graphql } from "../deps.ts";

import { Auth, Util, Redis } from "./server.tsx";
import type { Resolvers as GraphQLResolvers, QueryResolvers, MutationResolvers } from "../graphql/types.ts";
import type { Node } from "../graphql/types.ts";
import type { User, UserJwt } from "../graphql/types.ts";
import { RedisPayload, redisPrefix } from "../graphql/types.ts";

type Context = Oak.Context;

class Query implements QueryResolvers<Context>
{
    private constructor() { Util.bind(this); }
    public static create(): Query
    {
        const instance = new Query();
        return instance;
    }
    async node(_parent: unknown, args: { id: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const result = JSON.parse(await Redis.json.get(`${args.id}`, "$"));
        if (!result)
            throw new Error(`No JSON data returned for node with id ${args.id}`);

        const prefix = args.id.replaceAll(/(.*:\*:)(.*)/g, "$1");
        switch (prefix)
        {
            case redisPrefix["User"]:
                {
                    const user: RedisPayload["User"] | undefined =
                        (result as unknown[]).pop() as (RedisPayload["User"] | undefined);
                    if (!user)
                        throw new Error(`No user with id ${args.id}`);
                    return user as User;
                }
            default:
                throw new Error("Unknown node type");
        }
    }

    @Auth.authenticated<UserJwt, { email: string; }>(function (payload, args) { return payload.email === args.email; })
    async readUser(_parent: unknown, args: { email: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Redis.search.search("users", `@email:{${escapedEmail}}`);
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
        const result = JSON.parse(await Redis.json.get(`${jwtPayload.id}`, "$"));
        if (!result)
            throw new Error(`No JSON data returned for user with id ${jwtPayload.id}`);
        const user: RedisPayload["User"] | undefined =
            (result as unknown[]).pop() as (RedisPayload["User"] | undefined);
        if (!user)
            throw new Error(`No user found with id ${jwtPayload.id}`);
        return user;
    }
}

class Mutation implements MutationResolvers<Context>
{
    private constructor() { Util.bind(this); }
    public static create(): MutationResolvers<Context>
    {
        const instance = new Mutation();
        return instance;
    }
    @Auth.rateLimit()
    async createUser(_parent: unknown, args: { email: string; password: string; }, _context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const uuid = await Util.uuid();
        const id = `${redisPrefix["User"]}${uuid}`;

        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Redis.search.search("users", `@email:{${escapedEmail}}`);

        switch (typeof search)
        {
            case "number":
                break;
            default:
                throw new Error(`Email address ${args.email} already in use`);
        }
        const password = await scrypt.hash(args.password);
        const payload: RedisPayload["User"] =
        {
            id: id,
            email: args.email,
            password: password,
            receipt: null
        };
        await Redis.json.set(id, "$", JSON.stringify(payload));
        const user: User = { ...payload };
        return user;
    }
    async loginUser(_parent: unknown, args: { email: string; password: string; }, context: Oak.Context, _info: graphql.GraphQLResolveInfo)
    {
        const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Redis.search.search("users", `@email:{${escapedEmail}}`);
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
        const userInfo: RedisPayload["User"] = JSON.parse((parsedSearch.at(2) as ["$", string]).at(1) as string);
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
        const receipt = await Util.uuid();
        await Redis.json.set(args.id, "$.receipt", `"${receipt}"`);
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
            Mutation: Mutation.create(),
            Node:
            {
                __resolveType(parent: Node, _context: Context, _info: graphql.GraphQLResolveInfo)
                {
                    const prefix = parent.id.replaceAll(/(.*:\*:)(.*)/g, "$1");
                    switch (prefix)
                    {
                        case redisPrefix["User"]:
                            return "User";
                        default:
                            throw new Error("Unknown node type");
                    }
                }
            }
        };
        return resolvers;
    }
}