
import * as React from "react";
import * as ReactRouter from "react-router-dom";
import Relay from "react-relay/hooks";

import { Client, Console } from "./client.ts";
import type { Snowpack } from "./client.ts";

import App from "../components/App.tsx";


try 
{
    const clientAttributes =
    {
        graphql: (import.meta as Snowpack).env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT,
        refresh: (import.meta as Snowpack).env.SNOWPACK_PUBLIC_REFRESH_ENDPOINT,
    };
    const httpclient = Client.create(clientAttributes);

    switch ((import.meta as Snowpack).env.MODE)
    {
        case "development":
            {
                const element: React.ReactElement =
                    <Relay.RelayEnvironmentProvider environment={httpclient.relayEnvironment}>
                        <ReactRouter.BrowserRouter>
                            <App client={httpclient} />
                        </ReactRouter.BrowserRouter>
                    </Relay.RelayEnvironmentProvider>;
                httpclient.render(element);
                if ((import.meta as Snowpack).hot)
                    (import.meta as Snowpack).hot.accept();
                break;
            }
        case "production":
            {
                const element: React.ReactElement =
                    <React.StrictMode>
                        <Relay.RelayEnvironmentProvider environment={httpclient.relayEnvironment}>
                            <ReactRouter.BrowserRouter>
                                <App client={httpclient} />
                            </ReactRouter.BrowserRouter>
                        </Relay.RelayEnvironmentProvider>
                    </React.StrictMode>;
                httpclient.render(element);
                break;
            }
        default:
            throw new Error("Unknown Snowpack mode");
    }
}
catch (error) { Console.error(error); }