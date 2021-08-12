
import * as React from "react";
import * as ReactHelmet from "react-helmet";

const Lazy = React.lazy(() => import("./Lazy/Register.tsx"));

export function Helmet()
{
    const element: React.ReactElement =
        <ReactHelmet.Helmet>
            <title>httpsaurus | register</title>
        </ReactHelmet.Helmet>;
    return element;
}

export function Page()
{
    return <Lazy />;
}
