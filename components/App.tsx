
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { useToken } from "./Core/Core.tsx";
import { Spinner } from "./Loading.tsx";
import Index from "./Pages/Index.tsx";
import MobileProf from "./Pages/MobileProf.tsx";
import Login from "./Pages/Login.tsx";
import Register from "./Pages/Register.tsx";
import Error from "./Pages/Error.tsx";

export default function App()
{
    const [loading, setLoading] = React.useState(true);
    const effect = function ()
    {
        const refresh = async function ()
        {
            const options: RequestInit =
            {
                method: "POST",
                credentials: "include"
            };
            const response = await fetch("https://localhost:3443/jwt/refresh", options);

            if (response.ok)
                useToken((await response.json()).token);
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
