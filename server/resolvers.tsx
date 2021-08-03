
import { std, Oak, scrypt } from "../deps.ts";

import { Auth, Redis, Server } from "./server.tsx";
import type { Resolvers as GraphQLResolvers, QueryResolvers, MutationResolvers } from "../graphql/types.d.tsx";
import type { User, UserJwt, UserPayload } from "../graphql/types.d.tsx";
import type { QueryReadUserArgs } from "../graphql/types.d.tsx";
import type { UserInfo } from "../graphql/types.d.tsx";

const encoder = new TextEncoder();

class Query implements QueryResolvers<Oak.Context>
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
    @Auth.authenticated<UserJwt, QueryReadUserArgs>(function (payload, args) { return payload.id === args.id; })
    async readUser(_parent: unknown, args: QueryReadUserArgs, _context: Oak.Context)
    {
        const results = JSON.parse(await Server.redis.json.get(`users:${args.id}`, "$")) as unknown[];
        const user = results.pop() as User;
        user.id = args.id;
        return { user: user };
    }
    @Auth.authenticated<UserJwt>()
    async readCurrentUser(_parent: unknown, _args: unknown, context: Oak.Context)
    {
        const payload = context.state.payload;
        const results = JSON.parse(await Server.redis.json.get(`users:${payload.id}`, "$")) as unknown[];
        const user = results.pop() as User;
        user.id = payload.id;
        return { user: user };
    }
}

class Mutation implements MutationResolvers<Oak.Context>
{
    private constructor()
    {
        this.createUser = this.createUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.revokeUser = this.revokeUser.bind(this);
    }
    public static create(): MutationResolvers<Oak.Context>
    {
        const instance = new Mutation();
        return instance;
    }
    @Auth.rateLimit(Server.redis)
    async createUser(_parent: unknown, args: { input: UserInfo; }, _context: Oak.Context)
    {
        const id = await std.uuid.v5.generate(std.uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));

        const escapedEmail = args.input.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Server.redis.search.search("users", `@email:{${escapedEmail}}`);

        switch (typeof search)
        {
            case "number":
                break;
            default:
                throw new Error(`Email address ${args.input.email} already in use`);
        }
        const password = await scrypt.hash(args.input.password);
        const payload: UserPayload =
        {
            email: args.input.email,
            password: password,
            receipt: null
        };
        await Server.redis.json.set(`users:${id}`, "$", JSON.stringify(payload));
        const user: User =
        {
            id: id,
            ...payload
        };
        return { user: user };
    }
    async loginUser(_parent: unknown, args: { input: UserInfo; }, context: Oak.Context)
    {
        const escapedEmail = args.input.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
        const search = await Server.redis.search.search("users", `@email:{${escapedEmail}}`);
        switch (typeof search)
        {
            case "number":
                throw new Error(`User with email ${args.input.email} does not exist`);
            default:
                break;
        }
        if (search.at(0) as number > 1 || search.length > 3)
            throw new Error(`More than one user found with email ${args.input.email}`);
        const parsedSearch = search as [1, string, ["$", string]];
        const userInfo: UserPayload = JSON.parse((parsedSearch.at(2) as ["$", string]).at(1) as string);
        if (!await scrypt.verify(args.input.password, userInfo.password))
            throw new Error(`Incorrect password for user with email ${args.input.email}`);
        const id = (parsedSearch.at(1) as string).replaceAll("users:", "");

        const user: User =
        {
            id: id,
            ...userInfo
        };

        Auth.refresh.create<UserJwt>(user, context);

        const result =
        {
            token: Auth.access.create<UserJwt>(user),
            user: user
        };
        return result;
    }
    logoutUser(_parent: unknown, _args: unknown, context: Oak.Context)
    {
        Auth.refresh.reset(context);
        return { success: true };
    }
    async revokeUser(_parent: unknown, args: { id: string; }, _context: Oak.Context)
    {
        const receipt = await std.uuid.v5.generate(std.uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));
        await Server.redis.json.set(`users:${args.id}`, "$.receipt", `"${receipt}"`);
        return { success: true };
    }
}

export class Resolvers
{
    private constructor() { }
    public static create(): GraphQLResolvers<Oak.Context>
    {
        const resolvers: GraphQLResolvers<Oak.Context> =
        {
            Query: Query.create(),
            Mutation: Mutation.create()
        };
        return resolvers;
    }
}