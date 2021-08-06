
import { Console } from "../server/server.tsx";

try
{
    const tests: Deno.TestDefinition[] = [];
    for (const test of tests)
        Deno.test(test);
}
catch (error)
{
    Console.error(error.toString());
    Deno.exit(1);
}
