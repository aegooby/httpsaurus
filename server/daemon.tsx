
import { yargs } from "../deps.ts";

import { Resolvers } from "./resolvers.tsx";
import { Server, Console } from "./server.tsx";
import type { ServerAttributes } from "./server.tsx";
import type { UserJwt } from "../graphql/types.d.tsx";

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
            const schemaFields =
                [{ name: "$.email", type: "TAG", as: "email", sortable: true }];
            const parameters = { prefix: [{ count: 1, name: "users:" }] };
            await Server.redis.search.create("users", "JSON", schemaFields, parameters);
        }
        catch (error) { Console.log(error); }

        await httpserver.serve();
    }
    catch (error) { Console.error(error); }
}