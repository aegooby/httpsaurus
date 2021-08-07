
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Relay from "relay-runtime";

import { Console } from "./console.ts";
export { Console } from "./console.ts";

interface Document
{
    querySelector: (selectors: string) => DocumentFragment;
}

interface ClientAttributes
{
    graphql: string;
    refresh: string;
}

export declare const document: Document;
export type Snowpack = ImportMeta &
{ hot: { accept: () => unknown; }; env: Record<string, string>; };

export class Client
{
    private graphql: string = {} as string;
    private refresh: string = {} as string;
    public relayEnvironment: Relay.Environment = {} as Relay.Environment;
    public static token: string | undefined = undefined;
    private constructor()
    {
        this.fetchRefresh = this.fetchRefresh.bind(this);
        this.fetchRelay = this.fetchRelay.bind(this);
        this.fetchGraphQL = this.fetchGraphQL.bind(this);
    }
    public static create(attributes: ClientAttributes): Client
    {
        const instance = new Client();
        instance.graphql = attributes.graphql;
        instance.refresh = attributes.refresh;
        const relayEnvironmentConfig =
        {
            network: Relay.Network.create(instance.fetchRelay),
            store: new Relay.Store(new Relay.RecordSource()),
            configName: "Environment"
        };
        instance.relayEnvironment = new Relay.Environment(relayEnvironmentConfig);
        return instance;
    }
    public async fetchRefresh(): Promise<void>
    {
        const options: RequestInit =
        {
            method: "POST",
            credentials: "include"
        };
        const response = await fetch(this.refresh, options);

        if (response.ok)
            Client.token = (await response.json()).token;
    }
    private async fetchRelay(params: Relay.RequestParameters, variables: Relay.Variables): Promise<Relay.GraphQLResponse>
    {
        return await this.fetchGraphQL({ query: params.text, variables: variables }) as Relay.GraphQLResponse;
    }
    private async fetchGraphQL(data: unknown): Promise<unknown>
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
        return await (await fetch(this.graphql, fetchOptions)).json();
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
