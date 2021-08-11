
import * as React from "react";

const Lazy = React.lazy(() => import("./Lazy/Register.tsx"));

export default function Register()
{
    return <Lazy />;
}
