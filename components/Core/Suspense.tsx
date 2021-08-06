
import * as React from "react";
import { environment, Environment } from "./Environment.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

import nprogress from "nprogress";

interface SuspenseProps
{
    children?: React.ReactNode;
    fallback: NonNullable<React.ReactNode> | null;
    loading?: true;
    errorFallback?: NonNullable<React.ReactNode> | null;
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
                const suspense: React.ReactElement =
                    <React.Suspense fallback={props.fallback}>
                        {props.children}
                    </React.Suspense>;
                const element: React.ReactElement =
                    props.noErrorBoundary ?
                        suspense :
                        <ErrorBoundary fallback={props.errorFallback ?? props.fallback}>
                            {suspense}
                        </ErrorBoundary>;
                return element;
            }
    }
}