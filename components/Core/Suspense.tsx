
import * as React from "react";
import { environment, Environment } from "./Environment.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

import nprogress from "nprogress";

interface SuspenseProps extends React.SuspenseProps
{
    loading?: true;
    noErrorBoundary?: true;
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
                const suspense: React.ReactElement =
                    <React.Suspense fallback={props.fallback}>
                        {props.children}
                    </React.Suspense>;
                const element: React.ReactElement =
                    props.noErrorBoundary ?
                        suspense :
                        <ErrorBoundary fallback={props.fallback}>
                            {suspense}
                        </ErrorBoundary>;
                return element;
            }
    }
}