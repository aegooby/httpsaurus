
import * as React from "react";

const Lazy = React.lazy(() => import("./Lazy/Login.tsx"));

export default function Login()
{
    return <Lazy />;
}
