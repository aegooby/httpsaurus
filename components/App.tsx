
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { useRefresh, useStartLoading, useFinishLoading } from "./Core/Core.tsx";
import { Spinner } from "./Loading.tsx";
import Index from "./Pages/Index.tsx";
import MobileProf from "./Pages/MobileProf.tsx";
import Login from "./Pages/Login.tsx";
import Register from "./Pages/Register.tsx";
import Error from "./Pages/Error.tsx";
import type { Client } from "../client/client.tsx";

interface Props
{
    client: Client;
}
export default function App(props: Props)
{
    const [loading, effect] = useRefresh(props.client.fetchRefresh);
    React.useEffect(effect, []);

    const state = ReactRouter.useLocation().state;
    if (state && (state as Record<string, unknown>).redirected)
    {
        useFinishLoading();
        (state as Record<string, unknown>).redirected = false;
    }
    const [loaded, setLoaded] = React.useState(false);
    const loadingEffect = function ()
    {
        if (!loaded)
            useStartLoading();
        return function ()
        {
            useFinishLoading();
            if (!loaded)
                setLoaded(true);
        };
    };
    React.useEffect(loadingEffect);

    if (loading()) return <Spinner />;
    else
    {
        const element =
            <ReactRouter.Routes>
                <ReactRouter.Route path="/" element={<Index />} />
                <ReactRouter.Route path="/mobile-prof" element={<MobileProf />} />
                <ReactRouter.Route path="/login" element={<Login />} />
                <ReactRouter.Route path="/register" element={<Register />} />
                <ReactRouter.Route path="*" element={<Error code={404} text="Not Found" />} />
            </ReactRouter.Routes>;
        return element;
    }
}
