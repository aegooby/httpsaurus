
import * as React from "react";
import nprogress from "nprogress";

import { environment, Environment } from "./Core/Core.tsx";

export function useStartLoading()
{
    switch (environment())
    {
        case Environment.SERVER:
            break;
        case Environment.CLIENT:
            if (!nprogress.isStarted())
                nprogress.start();
            break;
    }
}
export function useFinishLoading()
{
    switch (environment())
    {
        case Environment.SERVER:
            break;
        case Environment.CLIENT:
            if (nprogress.isStarted())
                nprogress.done();
            break;
    }
}

export function Spinner()
{
    const element =
        <div className="load-spinner-wrapper">
            <div className="load-spinner">
                <div className="inner one"></div>
                <div className="inner two"></div>
                <div className="inner three"></div>
            </div>
        </div>;
    return element;
}