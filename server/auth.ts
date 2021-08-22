
import { jwt, keypair, Oak } from "../deps.ts";

import { Redis } from "./redis.ts";
import { Util } from "./util.ts";

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
    public readonly keypair: keypair.KeypairResults = keypair.default();
    public path: string = {} as string;
    protected lifetime: string = {} as string;
    protected constructor() { Util.bind(this); }
    public verify<UserJWT extends UserJWTBase = never>(token: string): UserJWT
    {
        const verified =
            jwt.verify(token, this.keypair.private, { complete: true });
        const result = (verified as jwt.Jwt).payload as UserJWT;
        return result;
    }
}

class AccessToken extends Token
{
    private constructor()
    {
        super();
        Util.bind(this);
    }
    public static create(attributes: TokenAttributes): AccessToken
    {
        const instance = new AccessToken();
        instance.path = attributes.path;
        instance.lifetime = attributes.lifetime;
        return instance;
    }
    public create<UserJWT extends UserJWTBase = never>(payload: UserJWT): string
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
        Util.bind(this);
    }
    public static create(attributes: TokenAttributes): RefreshToken
    {
        const instance = new RefreshToken();
        instance.path = attributes.path;
        instance.lifetime = attributes.lifetime;
        return instance;
    }
    public create<UserJWT extends UserJWTBase = never>(payload: UserJWT,
        context: Oak.Context): string
    {
        const signOptions = { expiresIn: this.lifetime };
        const result = jwt.sign(payload, this.keypair.private, signOptions);
        const cookieOptions: Oak.CookiesSetDeleteOptions =
        {
            path: this.path,
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        };

        context.cookies =
            new Oak.Cookies(context.request, context.response, cookieOptions);
        context.cookies.set("refresh", result, cookieOptions);
        return result;
    }
    public reset(context: Oak.Context): void
    {
        const cookieOptions = { path: this.path, httpOnly: true };
        context.cookies.set("refresh", null, cookieOptions);
    }
}

export class AuthError extends Error
{
    constructor(message: string | undefined)
    {
        super(message);

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, AuthError);

        this.name = "AuthError";
    }
}

export class Auth<UserJWT extends UserJWTBase = never>
{
    public static access =
        AccessToken.create({ path: "/jwt/access", lifetime: "15m" });
    public static refresh =
        RefreshToken.create({ path: "/jwt/refresh", lifetime: "7d" });

    private constructor() { Util.bind(this); }

    public static async create<UserJWT extends UserJWTBase = never>()
        : Promise<Auth<UserJWT>>
    {
        const instance = new Auth<UserJWT>();
        return await Promise.resolve(instance);
    }
    public static authenticate<UserJWT extends UserJWTBase = never>()
        : MethodDecorator
    {
        return (_target, _propertyKey, descriptor: PropertyDescriptor) =>
        {
            const method = descriptor.value;

            descriptor.value = async (parent: unknown,
                args: unknown,
                context: Oak.Context) =>
            {
                try
                {
                    if (!context.request.headers.has("authorization"))
                        throw new AuthError("\"Authorization\" header not present");
                    const authorization =
                        context.request.headers.get("authorization") as string;

                    const token = authorization
                        .replaceAll("Bearer ", "")
                        .replaceAll("bearer ", "");
                    const payload = Auth.access.verify<UserJWT>(token);
                    context.state.payload = payload;
                }
                catch (error)
                {
                    context.state.error =
                        `Authentication failed with error: ${error}`;
                }
                return await method(parent, args, context);
            };
        };
    }
    public static rateLimit(options: { limit: number; expiry: number; })
        : MethodDecorator
    {
        return (_target, _propertyKey, descriptor: PropertyDescriptor) =>
        {
            const method = descriptor.value;

            descriptor.value = async (parent: unknown,
                args: unknown,
                context: Oak.Context) =>
            {
                const key = `rate-limit:${context.request.ip}`;
                const count = await Redis.main.incr(key);

                if (count > options.limit)
                {
                    context.response.status = Oak.Status.TooManyRequests;
                    const text =
                        Oak.STATUS_TEXT.get(Oak.Status.TooManyRequests);
                    const error = `${Oak.Status.TooManyRequests}: ${text}`;
                    throw new Error(error);
                }
                else if (1 >= count)
                    await Redis.main.expire(key, options.expiry);
                return await method(parent, args, context);
            };
        };
    }
    public post(): Oak.Middleware
    {
        return async (context: Oak.Context, next: () => Promise<unknown>) =>
        {
            try 
            {
                const refresh = context.cookies.get("refresh");
                if (!refresh)
                    throw new Error(`Refresh cookie not found`);
                const jwtPayload = Auth.refresh.verify<UserJWT>(refresh);
                const result =
                    JSON.parse(await Redis.json.get(`${jwtPayload.id}`, "$"));
                if (!result)
                    throw new Error(`No JSON data returned for user with id ${jwtPayload.id}`);
                const user = (result as unknown[]).pop() as UserJWT | undefined;
                if (!user)
                    throw new Error(`No user found with id ${jwtPayload.id}`);
                user.id = jwtPayload.id;
                if (user.receipt !== jwtPayload.receipt)
                    throw new Error(`Receipts do not match`);

                Auth.refresh.create(user, context);

                context.response.status = Oak.Status.OK;
                context.response.body = { token: Auth.access.create(user) };
            }
            catch (error)
            {
                const body = { error: `${error}` };
                context.response.body = JSON.stringify(body);
                context.response.status = Oak.Status.Forbidden;
            }
            await next();
        };
    }
}
