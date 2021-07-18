
import * as React from "react";

const Lazy = React.lazy(() => import("./Lazy/Login.tsx"));
import Page from "../Page.tsx";

export default function Login()
{
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy />}
            lazy
        />;
    return element;
}
