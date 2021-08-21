
import { std } from "../../deps.ts";
import { Server, ServerAttributes } from "../server.tsx";
import { Console } from "../console.ts";

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