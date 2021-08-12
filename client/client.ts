
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Relay from "relay-runtime";

import { Console } from "./console.ts";
export { Console } from "./console.ts";

interface Document
{
    querySelector: (selectors: string) => DocumentFragment;
}

export declare const document: Document;

interface SnowpackHMR
{
    accept: () => unknown;
}
type SnowpackEnv = Record<string, string>;
interface SnowpackImportMetaExtensions
{
    hot: SnowpackHMR | undefined;
    env: SnowpackEnv;
}
type SnowpackImportMeta = ImportMeta & SnowpackImportMetaExtensions;

export class Client
{
    public static hot: SnowpackHMR | undefined =
        (import.meta as SnowpackImportMeta).hot;
    public static readonly env: SnowpackEnv =
        (import.meta as SnowpackImportMeta).env;

    private static relayEnvironmentConfig =
        {
            network: Relay.Network.create(Client.fetchRelay),
            store: new Relay.Store(new Relay.RecordSource()),
            configName: "Environment"
        };
    public static relayEnvironment: Relay.Environment =
        new Relay.Environment(Client.relayEnvironmentConfig);

    public static token: string | undefined = undefined;

    private constructor() { }
    public static create(): Client
    {
        const instance = new Client();
        return instance;
    }
    public static async fetchRefresh(): Promise<void>
    {
        const options: RequestInit =
        {
            method: "POST",
            credentials: "include"
        };
        const response =
            await fetch(Client.env.SNOWPACK_PUBLIC_REFRESH_ENDPOINT, options);
        if (response.ok)
            Client.token = (await response.json()).token;
    }
    private static async fetchRelay(params: Relay.RequestParameters, variables: Relay.Variables): Promise<Relay.GraphQLResponse>
    {
        return await Client.fetchGraphQL({ query: params.text, variables: variables }) as Relay.GraphQLResponse;
    }
    private static async fetchGraphQL(data: unknown): Promise<unknown>
    {
        const headers: Headers = new Headers();
        headers.set("Content-Type", "application/json");
        if (Client.token)
            headers.set("Authorization", "Bearer " + Client.token);
        const fetchOptions =
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        };
        const response =
            await fetch(Client.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT, fetchOptions);
        return await response.json();
    }
    public hydrate(element: React.ReactElement): void
    {
        Console.log("Hydrating React");
        ReactDOM.hydrate(element, document.querySelector("#root"));
    }
    public render(element: React.ReactElement): void
    {
        Console.log("Rendering React");
        ReactDOM.render(element, document.querySelector("#root"));
    }
}
