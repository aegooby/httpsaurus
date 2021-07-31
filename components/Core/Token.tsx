
import { Client } from "../../client/client.tsx";

export function useToken(value?: string): string
{
    if (value)
        Client.token = value;
    return Client.token;
}
