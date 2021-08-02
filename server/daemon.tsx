
import * as uuid from "@std/uuid";

import * as Oak from "oak";
import * as yargs from "@yargs/yargs";
import * as scrypt from "scrypt";

import { Server, Redis, Console, Auth } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import type { Resolvers, QueryResolvers, MutationResolvers } from "../graphql/types.d.tsx";
import type { User, UserJwt, UserPayload } from "../graphql/types.d.tsx";
import type { QueryReadUserArgs } from "../graphql/types.d.tsx";
import type { UserInfo } from "../graphql/types.d.tsx";

const args = yargs.default(Deno.args)
    .usage("usage: $0 server/daemon.tsx --hostname <host> [--domain <name>] [--tls <path>]")
    .hide("help")
    .hide("version")
    .hide("hostname")
    .demandOption(["hostname"])
    .parse();

try
{
    const encoder = new TextEncoder();
    const redis = await Redis.create({ retries: 10 });
    try 
    {
        const schemaFields = [{ name: "$.email", type: "TAG", as: "email", sortable: true }];
        await redis.search.create("users", "JSON", schemaFields, { prefix: [{ count: 1, name: "users:" }] });
    }
    catch { undefined; }

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
            const results = JSON.parse(await redis.json.get(`users:${args.id}`, "$")) as unknown[];
            const user = results.pop() as User;
            user.id = args.id;
            return { user: user };
        }
        @Auth.authenticated<UserJwt>()
        async readCurrentUser(_parent: unknown, _args: unknown, context: Oak.Context)
        {
            const payload = context.state.payload;
            const results = JSON.parse(await redis.json.get(`users:${payload.id}`, "$")) as unknown[];
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
        @Auth.rateLimit(redis)
        async createUser(_parent: unknown, args: { input: UserInfo; }, _context: Oak.Context)
        {
            const id = await uuid.v5.generate(uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));

            const escapedEmail = args.input.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
            const search = await redis.search.search("users", `@email:{${escapedEmail}}`);

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
            await redis.json.set(`users:${id}`, "$", JSON.stringify(payload));
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
            const search = await redis.search.search("users", `@email:{${escapedEmail}}`);
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
            const receipt = await uuid.v5.generate(uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));
            await redis.json.set(`users:${args.id}`, "$.receipt", `"${receipt}"`);
            return { success: true };
        }
    }

    const resolvers: Resolvers<Oak.Context> =
    {
        Query: Query.create(),
        Mutation: Mutation.create()
    };
    const serverAttributes: ServerAttributes =
    {
        secure: !!args.tls,
        domain: args.domain,
        routes: {},
        hostname: args.hostname,
        port: 3080,

        portTls: 3443,
        cert: args.tls,

        headElements: [],

        redis: redis,

        schema: "graphql/schema.gql",
        resolvers: resolvers,
    };
    const httpserver = await Server.create<UserJwt>(serverAttributes);

    // const cleanup = function () { redis.main.close(); httpserver.close(); };
    // Deno.signals.interrupt().then(cleanup);

    await httpserver.serve();
}
catch (error) { Console.error(error); }