
import * as React from "react";

import { GraphQL, Console } from "../Core/Core.tsx";
import graphql from "../../graphql/graphql.tsx";
const Lazy = React.lazy(() => import("./Lazy/Index.tsx"));
import Page from "../Page.tsx";

export default function Index()
{
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy />}
            lazy
        />;
    return element;
}
