
import * as React from "react";

const Lazy = React.lazy(() => import("./Lazy/Register.tsx"));
import Page from "../Page.tsx";

export default function Register()
{
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy />}
            lazy
        />;
    return element;
}
