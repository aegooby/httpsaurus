
import * as React from "react";
import * as ReactHelmet from "react-helmet";

const Lazy = React.lazy(() => import("./Lazy/Login.tsx"));

export function Helmet()
{
    const element: React.ReactElement =
        <ReactHelmet.Helmet>
            <title>httpsaurus | login</title>
        </ReactHelmet.Helmet>;
    return element;
}

export function Page()
{
    return <Lazy />;
}
