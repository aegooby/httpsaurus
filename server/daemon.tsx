
import { yargs } from "../deps.ts";

import { Resolvers } from "./resolvers.ts";
import { Server, Console } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import type { UserJwt } from "../graphql/types.ts";

const args = yargs.default(Deno.args)
    .usage("usage: $0 server/daemon.tsx --hostname <host> [--domain <name>] [--tls <path>] [--devtools]")
    .hide("help")
    .hide("version")
    .hide("hostname")
    .demandOption(["hostname"])
    .parse();

if (import.meta.main)
{
    try
    {
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

            devtools: !!args.devtools,
            redis: true,

            schema: "graphql/schema.gql",
            resolvers: Resolvers.create(),
        };
        const httpserver = await Server.create<UserJwt>(serverAttributes);

        try
        {
            /* Global node index */
            const schemaFields =
                [{ name: "$.id", type: "TAG", as: "id" }];
            const parameters = { prefix: [{ count: 1, name: "nodes:" }] };
            await Server.redis.search.create("nodes", "JSON", schemaFields, parameters);
        }
        catch { undefined; }
        try
        {
            /* Users index */
            const schemaFields =
                [{ name: "$.email", type: "TAG", as: "email", sortable: true }];
            const parameters = { prefix: [{ count: 1, name: "nodes:users:" }] };
            await Server.redis.search.create("users", "JSON", schemaFields, parameters);
        }
        catch { undefined; }

        await httpserver.serve();
    }
    catch (error) { Console.error(error); }
}