
import * as uuid from "@std/uuid";

import * as React from "react";
import * as Oak from "oak";
import * as yargs from "@yargs/yargs";
import * as scrypt from "scrypt";

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

try
{
    const redis = await Redis.create({ hashRounds: 10 });
    try { await redis.search.create("users", "JSON", [{ name: "$.email", type: "TEXT", as: "email", nostem: true, sortable: true }]); }
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