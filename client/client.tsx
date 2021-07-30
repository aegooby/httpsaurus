
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Relay from "relay-runtime";

import { Console } from "./console.tsx";
export { Console } from "./console.tsx";

interface Document
{
    querySelector: (selectors: string) => DocumentFragment;
}

interface ClientAttributes
{
    api: string;
}

export declare const document: Document;
export type Snowpack = ImportMeta & { hot: { accept: () => unknown; }; env: Record<string, string>; };

export class Client
{
    private api: string = {} as string;
    public relayEnvironment: Relay.Environment = {} as Relay.Environment;
    private constructor()
    {
        this.fetchRelay = this.fetchRelay.bind(this);
        this.fetch = this.fetch.bind(this);
    }
    public static create(attributes: ClientAttributes): Client
    {
        const instance = new Client();
        instance.api = attributes.api;
        const relayEnvironmentConfig =
        {
            network: Relay.Network.create(instance.fetchRelay),
            store: new Relay.Store(new Relay.RecordSource())
        };
        instance.relayEnvironment = new Relay.Environment(relayEnvironmentConfig);
        return instance;
    }
    public async fetchRelay(params: Relay.RequestParameters, variables: Relay.Variables): Promise<Relay.GraphQLResponse>
    {
        return await this.fetch({ query: params.text, variables: variables }) as Relay.GraphQLResponse;
    }
    public async fetch(data: unknown): Promise<unknown>
    {
        const fetchOptions =
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        };
        return await (await fetch(this.api, fetchOptions)).json();
    }
    public hydrate(element: React.ReactElement): void
    {
        Console.log("Hydrating bundle");
        ReactDOM.hydrate(element, document.querySelector("#root"));
    }
    public render(element: React.ReactElement): void
    {
        Console.log("Hydrating bundle");
        ReactDOM.render(element, document.querySelector("#root"));
    }
}
