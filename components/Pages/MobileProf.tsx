
import * as React from "react";

const Lazy = React.lazy(() => import("./Lazy/MobileProf.tsx"));

export default function MobileProf()
{
    return <Lazy />;
}
