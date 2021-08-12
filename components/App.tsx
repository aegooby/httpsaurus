
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { Suspense, useRefresh, useStartLoading, useFinishLoading, Client } from "./Core/Core.tsx";
import { Spinner } from "./Loading.tsx";
import * as Index from "./Pages/Index.tsx";
import * as Login from "./Pages/Login.tsx";
import * as Register from "./Pages/Register.tsx";
import * as Error from "./Pages/Error.tsx";

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
            <>
                <ReactRouter.Routes>
                    <ReactRouter.Route path="/" element={<Index.Helmet />} />
                    <ReactRouter.Route path="/login" element={<Login.Helmet />} />
                    <ReactRouter.Route path="/register" element={<Register.Helmet />} />
                    <ReactRouter.Route path="*" element={<Error.Helmet code={404} text="not found" />} />
                </ReactRouter.Routes>
                <Suspense fallback={<Spinner padding="5rem" />}>
                    <ReactRouter.Routes>
                        <ReactRouter.Route path="/" element={<Index.Page />} />
                        <ReactRouter.Route path="/login" element={<Login.Page />} />
                        <ReactRouter.Route path="/register" element={<Register.Page />} />
                        <ReactRouter.Route path="*" element={<Error.Page code={404} text="not found" />} />
                    </ReactRouter.Routes>
                </Suspense>
            </>;
        return element;
    }
}
