
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import Index from "./Pages/Index.tsx";
import MobileProf from "./Pages/MobileProf.tsx";
import Login from "./Pages/Login.tsx";
import Register from "./Pages/Register.tsx";
import Error from "./Pages/Error.tsx";

export default function App()
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
