
import { std } from "../deps.ts";

const encoder = new TextEncoder();

export class Util
{
    public static async uuid(): Promise<string>
    {
        const namespace = std.uuid.v1.generate() as string;
        const data = encoder.encode(crypto.randomUUID());
        return await std.uuid.v5.generate(namespace, data);
    }
}
