
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
    // deno-lint-ignore ban-types
    public static bind(target: object, exclude?: Set<string>): void
    {
        const excluded = exclude ?? new Set();
        excluded.add("constructor");
        const prototype = Reflect.getPrototypeOf(target);
        if (!prototype)
            throw new TypeError("Prototype is null when attempting to bind");
        for (const key of Reflect.ownKeys(prototype) as string[])
        {
            const prototypeRecord = prototype as Record<string, unknown>;
            const targetRecrod = target as Record<string, unknown>;
            switch (typeof prototypeRecord[key])
            {
                case "function":
                    if (excluded.has(key))
                        break;
                    // deno-lint-ignore ban-types
                    targetRecrod[key] = (prototypeRecord[key] as Function).bind(target);
                    break;
                default:
                    break;
            }
        }
    }
}