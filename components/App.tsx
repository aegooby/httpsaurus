
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { Suspense, useRefresh, useStartLoading, useFinishLoading, Client } from "./Core/Core.tsx";
import { Spinner } from "./Loading.tsx";
import Index from "./Pages/Index.tsx";
import MobileProf from "./Pages/MobileProf.tsx";
import Login from "./Pages/Login.tsx";
import Register from "./Pages/Register.tsx";
import Error from "./Pages/Error.tsx";

export default function App()
{
    /* Obtains refresh JWT. */
    const [loading, effect] = useRefresh(Client.fetchRefresh);
    React.useEffect(effect, []);

    /* Handles loading bars. */
    const location = ReactRouter.useLocation();
    const state = location.state as Record<string, unknown> | null;
    if (state && state.redirected)
    {
        useFinishLoading();
        state.redirected = false;
    }
    React.useState(useStartLoading());
    React.useState(!loading() && useFinishLoading());

    if (loading()) return <Spinner padding="10rem" />;
    else
    {
        const element =
            <Suspense fallback={<Spinner padding="5rem" />}>
                <ReactRouter.Routes>
                    <ReactRouter.Route path="/" element={<Index />} />
                    <ReactRouter.Route path="/mobile-prof" element={<MobileProf />} />
                    <ReactRouter.Route path="/login" element={<Login />} />
                    <ReactRouter.Route path="/register" element={<Register />} />
                    <ReactRouter.Route path="*" element={<Error code={404} text="Not Found" />} />
                </ReactRouter.Routes>
            </Suspense>;
        return element;
    }
}
