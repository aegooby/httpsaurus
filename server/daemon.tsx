
import * as uuid from "@std/uuid";

import * as React from "react";
import * as Oak from "oak";
import * as yargs from "@yargs/yargs";
import * as scrypt from "scrypt";

import { Server, Redis, Console, Auth } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import type { Resolvers, QueryResolvers, MutationResolvers, User } from "../graphql/types.d.tsx";

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
    try { await redis.search.create("users", "JSON", [{ name: "$.email", type: "TAG", as: "email", sortable: true }]); }
    catch { undefined; }

    class Query implements QueryResolvers<Oak.Context>
    {
        private constructor() 
        {
            this.get = this.get.bind(this);
            this.queryUser = this.queryUser.bind(this);
        }
        public static create(): Query
        {
            const instance = new Query();
            return instance;
        }
        async get(_parent: unknown, args: { key: string; }, _context: Oak.Context)
        {
            return (await redis.main.get(args.key)) ?? null;
        }
        @Auth.authenticated(function (payload, args) { return payload.id === (args as Record<string, unknown>).id; })
        async queryUser(_parent: unknown, args: { id: string; }, _context: Oak.Context)
        {
            const results = JSON.parse(await redis.json.get(`users:${args.id}`, "$")) as unknown[];
            const user = results.pop() as User;
            user.id = args.id;
            return { user: user };
        }
    }

    class Mutation implements MutationResolvers<Oak.Context>
    {
        private constructor() 
        {
            this.set = this.set.bind(this);
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
        async set(_parent: unknown, args: { key: string; value: string; }, _context: Oak.Context)
        {
            return await redis.main.set(args.key, args.value);
        }
        async createUser(_parent: unknown, args: { email: string; password: string; }, _context: Oak.Context)
        {
            const id = await uuid.v5.generate(uuid.v1.generate() as string, encoder.encode(crypto.randomUUID()));

            const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
            const search = await redis.search.search("users", `@email:{${escapedEmail}}`);

            switch (typeof search)
            {
                case "number":
                    break;
                default:
                    throw new Error(`Email address ${args.email} already in use`);
            }
            const password = await scrypt.hash(args.password);
            const payload = { email: args.email, password: password };
            await redis.json.set(`users:${id}`, "$", JSON.stringify(payload));
            const user = { id: id, email: args.email };
            return { user: user };
        }
        async loginUser(_parent: unknown, args: { email: string; password: string; }, context: Oak.Context)
        {
            const escapedEmail = args.email.replaceAll("@", "\\@").replaceAll(".", "\\.");
            const search = await redis.search.search("users", `@email:{${escapedEmail}}`);
            switch (typeof search)
            {
                case "number":
                    throw new Error(`User with email ${args.email} does not exist`);
                default:
                    break;
            }
            const user = {} as User;
            if (search.at(0) as number > 1 || search.length > 3)
                throw new Error(`More than one user found with email ${args.email}`);
            const parsedSearch = search as [1, string, ["$", string]];
            const userInfo = JSON.parse((parsedSearch.at(2) as ["$", string]).at(1) as string);
            if (!await scrypt.verify(args.password, userInfo.password))
                throw new Error(`Incorrect password for user with email ${args.email}`);
            user.id = (parsedSearch.at(1) as string).replaceAll("users:", "");
            user.email = userInfo.email;
            user.receipt = userInfo.receipt;

            Auth.refresh.create(user as User, context);

            const result =
            {
                accessToken: Auth.access.create(user as User),
                user: user,
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
    const httpserver = await Server.create<User>(serverAttributes);

    // const cleanup = function () { redis.main.close(); httpserver.close(); };
    // Deno.signals.interrupt().then(cleanup);

    await httpserver.serve();
}
catch (error) { Console.error(error); }