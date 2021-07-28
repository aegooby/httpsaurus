
import * as jwt from "jsonwebtoken";
import * as keypair from "keypair";
import * as Oak from "oak";

import { Console } from "./console.tsx";
import { Redis } from "./redis.tsx";

interface TokenAttributes
{
    path: string;
    lifetime: string;
}
export interface UserJWTBase
{
    id: string;
    receipt?: string | null;
}
abstract class Token
{
    public keypair: keypair.KeypairResults = keypair.default();
    public path: string = {} as string;
    protected lifetime: string = {} as string;
    protected constructor()
    {
        this.verify = this.verify.bind(this);
    }
    public verify<UserJWT extends UserJWTBase>(token: string): UserJWT
    {
        const result = jwt.verify(token, this.keypair.private, { complete: true });
        return (result as jwt.Jwt).payload as UserJWT;
    }
}

class AccessToken extends Token
{
    private constructor()
    {
        super();
        this.create = this.create.bind(this);
    }
    public static create(attributes: TokenAttributes): AccessToken
    {
        const instance = new AccessToken();
        instance.path = attributes.path;
        instance.lifetime = attributes.lifetime;
        return instance;
    }
    public create<UserJWT extends UserJWTBase>(payload: UserJWT): string
    {
        const options = { expiresIn: this.lifetime };
        const result = jwt.sign(payload, this.keypair.private, options);
        return result;
    }
}

class RefreshToken extends Token
{
    private constructor()
    {
        super();
        this.create = this.create.bind(this);
    }
    public static create(attributes: TokenAttributes): RefreshToken
    {
        const instance = new RefreshToken();
        instance.path = attributes.path;
        instance.lifetime = attributes.lifetime;
        return instance;
    }
    public create<UserJWT extends UserJWTBase>(payload: UserJWT, context: Oak.Context): string
    {
        const signOptions = { expiresIn: this.lifetime };
        const result = jwt.sign(payload, this.keypair.private, signOptions);
        const cookieOptions = { path: this.path, httpOnly: true };
        context.cookies.set("refresh", result, cookieOptions);
        return result;
    }
    public reset(context: Oak.Context): void
    {
        const cookieOptions = { path: this.path, httpOnly: true };
        context.cookies.set("refresh", null, cookieOptions);
    }
}

export interface AuthAttributes
{
    redis: Redis;
}
export class Auth<UserJWT extends UserJWTBase>
{
    public static access = AccessToken.create({ path: "/jwt/access", lifetime: "15m" });
    public static refresh = RefreshToken.create({ path: "/jwt/refresh", lifetime: "7d" });

    private redis: Redis = {} as Redis;

    private constructor() { }

    public static async create<UserJWT extends UserJWTBase>(attributes: AuthAttributes): Promise<Auth<UserJWT>>
    {
        const instance = new Auth<UserJWT>();
        instance.redis = attributes.redis;
        return await Promise.resolve(instance);
    }
    public static authenticated<UserJWT extends UserJWTBase>(condition?: (payload: UserJWT, args: unknown) => boolean)
    {
        return (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
        {
            const method = descriptor.value;

            descriptor.value = (parent: unknown, args: unknown, context: Oak.Context) =>
            {
                if (!context.request.headers.has("authorization"))
                    throw new Error("\"Authorization\" header not present");
                const authorization = context.request.headers.get("authorization") as string;

                try
                {
                    const token = authorization.replaceAll("Bearer ", "").replaceAll("bearer ", "");
                    const payload = Auth.access.verify<UserJWT>(token);
                    if (condition && !condition(payload, args))
                        throw new Error("Authentication condition not met");

                    return method(parent, args, context);
                }
                catch (error)
                {
                    throw new Error(`Authentication failed with error: ${error}`);
                }
            };
        };
    }
    public post(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            const token = context.cookies.get("refresh");
            if (!token)
            {
                context.response.status = Oak.Status.Forbidden;
                await next();
                return;
            }
            try 
            {
                const payload = Auth.refresh.verify<UserJWT>(token);
                const user = JSON.parse(await this.redis.json.get(`users:${payload.id}`, "$")) as UserJWT;
                if (user.receipt !== payload.receipt)
                {
                    context.response.status = Oak.Status.Forbidden;
                    await next();
                    return;
                }

                Auth.refresh.create(user as UserJWT, context);

                context.response.status = Oak.Status.OK;
                context.response.body = { access: Auth.access.create(user as UserJWT) };
            }
            catch { context.response.status = Oak.Status.Forbidden; }
            await next();
        };
    }
}
