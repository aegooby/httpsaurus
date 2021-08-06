
import nprogress from "nprogress";

import { environment, Environment } from "./Environment.tsx";
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