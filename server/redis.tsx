
import * as redis from "redis";

export interface RedisAttributes
{
    url?: string;
}

interface RedisModuleAttributes
{
    redisMain: redis.Redis;
}

abstract class RedisModule
{
    protected redisMain: redis.Redis = {} as redis.Redis;
    constructor(attributes: RedisModuleAttributes)
    {
        this.redisMain = attributes.redisMain;
    }
}

class RedisJSON extends RedisModule
{
    private constructor(attributes: RedisModuleAttributes)
    {
        super(attributes);
    }
    public static async create(attributes: RedisModuleAttributes): Promise<RedisJSON>
    {
        const instance = new RedisJSON(attributes);
        return await Promise.resolve(instance);
    }

    public async del(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.DEL", key, ...options);
    }
    public async get(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.GET", key, ...options);
    }
    public async mget(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.MGET", key, ...options);
    }
    public async set(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.SET", key, ...options);
    }
    public async type(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.TYPE", key, ...options);
    }
    public async numincrby(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.NUMINCRBY", key, ...options);
    }
    public async nummultby(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.NUMMULTBY", key, ...options);
    }
    public async strappend(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.STRAPPEND", key, ...options);
    }
    public async strlen(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.STRLEN", key, ...options);
    }
    public async arrappend(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRAPPEND", key, ...options);
    }
    public async arrindex(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRINDEX", key, ...options);
    }
    public async arrinsert(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRINSERT", key, ...options);
    }
    public async arrlen(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRLEN", key, ...options);
    }
    public async arrpop(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRPOP", key, ...options);
    }
    public async arrtrim(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.ARRTRIM", key, ...options);
    }
    public async objkeys(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.OBJKEYS", key, ...options);
    }
    public async objlen(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.OBJLEN", key, ...options);
    }
    public async debug(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.DEBUG", key, ...options);
    }
    public async forget(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.FORGET", key, ...options);
    }
    public async resp(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("JSON.RESP", key, ...options);
    }
}

class RedisSearch extends RedisModule
{
    private constructor(attributes: RedisModuleAttributes)
    {
        super(attributes);
    }
    public static async create(attributes: RedisModuleAttributes): Promise<RedisSearch>
    {
        const instance = new RedisSearch(attributes);
        return await Promise.resolve(instance);
    }

    public async create(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.CREATE", key, ...options);
    }
    public async add(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.ADD", key, ...options);
    }
    public async aggregate(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.AGGREGATE", key, ...options);
    }
    public async info(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.INFO", key, ...options);
    }
    public async search(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.SEARCH", key, ...options);
    }
    public async explain(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.EXPLAIN", key, ...options);
    }
    public async del(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.DEL", key, ...options);
    }
    public async drop(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.DROP", key, ...options);
    }
    public async sugadd(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.SUGADD", key, ...options);
    }
    public async sugget(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.SUGGET", key, ...options);
    }
    public async sugdel(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.SUGDEL", key, ...options);
    }
    public async suglen(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.SUGLEN", key, ...options);
    }
    public async get(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.GET", key, ...options);
    }
    public async mget(key: string, ...options: string[]): Promise<redis.RedisReply>
    {
        return await this.redisMain.executor.exec("FT.MGET", key, ...options);
    }
}

export class Redis
{
    public json: RedisJSON = {} as RedisJSON;
    public search: RedisSearch = {} as RedisSearch;
    public main: redis.Redis = {} as redis.Redis;

    private static default: string = "redis://localhost:6379/" as const;
    private constructor() { }
    public static async create(attributes: RedisAttributes): Promise<Redis>
    {
        if (!attributes.url && !Deno.env.get("REDIS_URL"))
            throw new Error("Unable to find Redis URL");
        const url = attributes.url ?? Deno.env.get("REDIS_URL") ?? Redis.default;
        const { hostname, port = 6379, ...opts } = redis.parseURL(url);
        const connection = new redis.RedisConnection(hostname, port, opts);
        await connection.connect();
        const executor = new redis.MuxExecutor(connection);
        const instance = new Redis();
        instance.json = await RedisJSON.create({ redisMain: instance.main });
        instance.search = await RedisSearch.create({ redisMain: instance.main });
        instance.main = redis.create(executor);
        return instance;
    }
}