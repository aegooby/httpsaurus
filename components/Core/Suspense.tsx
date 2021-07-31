
import * as React from "react";
import { environment, Environment } from "./Core.tsx";

import nprogress from "nprogress";

interface SuspenseProps
{
    fallback: NonNullable<React.ReactNode> | null;
    children?: React.ReactNode;
    loading?: true;
}

export function Suspense(props: SuspenseProps)
{
    switch (environment())
    {
        case Environment.SERVER:
            { return <>{props.fallback}</>; }
        case Environment.CLIENT:
            {
                if (props.loading && !nprogress.isStarted())
                    React.useState(nprogress.start());
                const element: React.ReactElement =
                    <React.Suspense fallback={props.fallback}>
                        {props.children}
                    </React.Suspense>;
                return element;
            }
    }
}