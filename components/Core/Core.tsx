
export { Suspense } from "./Suspense/Suspense.tsx";
export { Console } from "../../client/console.tsx";

function throwOnClient() { Deno; }

export enum Environment
{
    CLIENT = "client",
    SERVER = "server",
}

export function environment(): Environment
{
    try
    {
        throwOnClient();
        return Environment.SERVER;
    }
    catch { return Environment.CLIENT; }
}
