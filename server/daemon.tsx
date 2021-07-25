
import * as uuid from "@std/uuid";

import * as React from "react";
import * as Oak from "oak";
import * as yargs from "@yargs/yargs";
import * as redis from "redis";

import { Server, Redis, Console } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import App from "../components/App.tsx";
import type { Resolvers } from "../graphql/types.d.tsx";

const args = yargs.default(Deno.args)
    .usage("usage: $0 server/daemon.tsx --hostname <host> [--domain <name>] [--tls <path>]")
    .hide("help")
    .hide("version")
    .hide("hostname")
    .demandOption(["hostname"])
    .parse();


class EmailExistsError extends Error
{
    constructor(message: string)
    {
        super(message);
        Object.setPrototypeOf(this, EmailExistsError.prototype);
    }
}
try
{
    const redis = await Redis.create({});
    try { await redis.search.create("users", "ON", "JSON", "SCHEMA", "$.email", "AS", "email", "TEXT", "NOSTEM", "SORTABLE"); }
    catch { Console.warn("Users index already present, skipping creation"); }
    const resolvers: Resolvers<Oak.Context> =
    {
        Query:
        {
            async get(_parent: unknown, args: { key: string; }, _context: Oak.Context)
            {
                return (await redis.main.get(args.key)) ?? null;
            }
        },
        Mutation:
        {
            async set(_parent: unknown, args: { key: string; value: string; }, _context: Oak.Context)
            {
                return await redis.main.set(args.key, args.value);
            },
            async createUser(_parent: unknown, args: { email: string; password: string; }, _context: Oak.Context)
            {
                const namespace = uuid.v1.generate() as string;
                const name = (new TextEncoder()).encode(crypto.randomUUID());
                const id = await uuid.v5.generate(namespace, name);
                // const password = scrypt.hash(args.password);
                const address = args.email.split("@")[0];
                const search = (await redis.search.search("users", `@email:(${address})`)).value() as redis.ConditionalArray;
                for (const result of search)
                {
                    try 
                    {
                        const json = JSON.parse((result as string[])[1]);
                        if (json.email === args.email)
                            throw new EmailExistsError("A user with this email already exists");
                    }
                    catch (error: unknown) 
                    {
                        if (error instanceof EmailExistsError)
                            throw error;
                    }
                }
                await redis.json.set(`users:${id}`, "$", JSON.stringify({ email: args.email, password: args.password }));
                return { id: id, email: args.email };
            }
        }
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

        App: <App client={undefined} />,
        headElements: [],

        schema: "graphql/schema.gql",
        resolvers: resolvers,
    };
    const httpserver = await Server.create(serverAttributes);
    await httpserver.serve();
}
catch (error) { Console.error(error); }