
import * as React from "react";

export function useRefresh(fetchRefresh: () => Promise<unknown>): [() => boolean, () => void]
{
    const [loading, setLoading] = React.useState(true);
    const effect = function ()
    {
        const refresh = async function ()
        {
            await fetchRefresh();
            setLoading(false);
        };
        refresh();
    };
    return [() => { return loading; }, effect];
}