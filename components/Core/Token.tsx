
import { Client } from "../../client/client.ts";

export function useToken(value?: string | null): string | undefined
{
    switch (typeof value)
    {
        case "object":
            Client.token = undefined;
            break;
        case "string":
            Client.token = value;
            break;
        default:
            break;
    }
    return Client.token;
}
