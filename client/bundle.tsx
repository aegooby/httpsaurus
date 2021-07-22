
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { Client, Console } from "./client.tsx";
import type { Snowpack } from "./client.tsx";

import App from "../components/App.tsx";


try 
{
    const clientAttributes =
    {
        api: (import.meta as Snowpack).env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT,
    };
    const httpclient = Client.create(clientAttributes);
    const element: React.ReactElement =
        <ReactRouter.BrowserRouter>
            <App client={httpclient} />
        </ReactRouter.BrowserRouter>;
    switch ((import.meta as Snowpack).env.MODE)
    {
        case "development":
            httpclient.render(element);
            if ((import.meta as Snowpack).hot)
                (import.meta as Snowpack).hot.accept();
            break;
        case "production":
            httpclient.hydrate(element);
            break;
        default:
            throw new Error("Unknown Snowpack mode");
    }
}
catch (error) { Console.error(error); }