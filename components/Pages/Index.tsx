
import * as React from "react";
import { graphql } from "relay-runtime";
import Relay from "react-relay/hooks";
import * as ReactHelmet from "react-helmet";

const Lazy = React.lazy(() => import("./Lazy/Index.tsx"));
import type { IndexQuery } from "./__generated__/IndexQuery.graphql.ts";

const query = graphql`
        query IndexQuery {
            readCurrentUser {
                id
                email
            }
        }
    `;

export function Helmet()
{
    const element: React.ReactElement =
        <ReactHelmet.Helmet>
            <title>httpsaurus | home</title>
        </ReactHelmet.Helmet>;
    return element;
}

export function Page()
{
    const [preloadedQuery, loadQuery] = Relay.useQueryLoader<IndexQuery>(query);
    React.useEffect(function () { loadQuery({}); }, []);
    return <Lazy query={query} preloadedQuery={preloadedQuery} />;
}
