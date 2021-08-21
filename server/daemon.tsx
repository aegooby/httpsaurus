
import { React, yargs } from "../deps.ts";

import { Resolvers } from "./resolvers.ts";
import { Server, Console, Redis } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import type { UserJwt } from "../graphql/types.ts";
import { redisIndex } from "../graphql/types.ts";

const args = yargs.default(Deno.args)
    .usage("usage: $0 server/daemon.tsx --hostname <host> --domain <name> [--proxy] [--tls <path>] [--devtools]")
    .hide("help")
    .hide("version")
    .hide("hostname")
    .demandOption(["hostname", "domain"])
    .parse();

if (import.meta.main)
{
    try
    {
        const serverAttributes: ServerAttributes =
        {
            secure: !!args.tls,
            domain: args.domain,
            hostname: args.hostname,
            port: 3080,
            proxy: !!args.proxy,
            routes: {},

            portTls: 3443,
            cert: args.tls,

            public: "/dist",
            headElements: [<title>turtle</title>],

            devtools: !!args.devtools,

            schema: "graphql/schema.gql",
            resolvers: Resolvers.create(),
        };
        const httpserver = await Server.create<UserJwt>(serverAttributes);

        await Redis.connect({});

        for (const index of Object.values(redisIndex))
        {
            try { await Redis.search.create(index.name, "JSON", index.schemaFields, index.parameters); }
            catch { undefined; }
        }

        await httpserver.serve();
    }
    catch (error) { Console.error(error); }
}