
export interface ListenBaseOptions extends Deno.ListenOptions
{
    secure: false;
}
export interface ListenTlsOptions extends Deno.ListenTlsOptions
{
    secure: true;
}
export type ListenOptions = ListenBaseOptions | ListenTlsOptions;
export type ConnectionAsyncIter =
    {
        [Symbol.asyncIterator](): AsyncGenerator<Deno.Conn, never, unknown>;
    };
export class Listener
{
    private nativeListeners: Map<number, [boolean, Deno.Listener]> = new Map<number, [boolean, Deno.Listener]>();
    private options: Array<ListenOptions> = [];

    constructor(options?: Array<ListenOptions>)
    {
        if (options) this.options = options;

        this.create = this.create.bind(this);
        this.listen = this.listen.bind(this);
        this.connections = this.connections.bind(this);
        this.secure = this.secure.bind(this);
        this.listener = this.listener.bind(this);
        this.keys = this.keys.bind(this);
        this.close = this.close.bind(this);
    }
    private create(options: ListenOptions): [boolean, Deno.Listener]
    {
        if (options.secure)
        {
            const listener = Deno.listenTls(options as Deno.ListenTlsOptions);
            this.nativeListeners.set(listener.rid, [options.secure, listener]);
            return [options.secure, listener];
        }
        else
        {
            const listener = Deno.listen(options as Deno.ListenOptions);
            this.nativeListeners.set(listener.rid, [options.secure, listener]);
            return [options.secure, listener];
        }
    }
    public listen(options?: Array<ListenOptions>): Array<[boolean, Deno.Listener]>
    {
        if (!options)
            return this.options.map(this.create);
        else
            return options.map(this.create);
    }
    public connections(key: number): ConnectionAsyncIter
    {
        if (!this.nativeListeners.has(key))
            throw new Error("Listener not found");
        const [_, nativeListener] = this.nativeListeners.get(key) as [boolean, Deno.Listener];
        const iterable =
        {
            async *[Symbol.asyncIterator]()
            {
                while (true)
                {
                    try
                    {
                        const connection = await nativeListener.accept();
                        yield connection;
                    }
                    catch { undefined; }
                }
            }
        };
        return iterable;
    }
    public secure(key: number): boolean
    {
        if (!this.nativeListeners.has(key))
            throw new Error("Listener not found");
        const [secure, _] = this.nativeListeners.get(key) as [boolean, Deno.Listener];
        return secure;
    }
    public listener(key: number): Deno.Listener
    {
        if (!this.nativeListeners.has(key))
            throw new Error("Listener not found");
        const [_, native] = this.nativeListeners.get(key) as [boolean, Deno.Listener];
        return native;
    }
    public keys(): Array<number>
    {
        return Array.from(this.nativeListeners.keys());
    }
    public close(key?: number): void
    {
        if (key && this.nativeListeners.has(key))
        {
            const [_, listener] = this.nativeListeners.get(key) as [boolean, Deno.Listener];
            this.nativeListeners.delete(listener.rid);
            listener.close();
        }
        else
        {
            for (const [_1, [_2, listener]] of this.nativeListeners)
                listener.close();
            this.nativeListeners.clear();
        }
    }
}