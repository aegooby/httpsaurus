
import * as React from "react";
import * as ReactRouter from "react-router-dom";

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
    const [loading, setLoading] = React.useState(true);
    const effect = function ()
    {
        const refresh = async function ()
        {
            await props.client.fetchRefresh();
            setLoading(false);
        };
        refresh();
    };
    React.useEffect(effect);
    if (loading)
        return <Spinner />;
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
