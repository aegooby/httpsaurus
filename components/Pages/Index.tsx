
import * as React from "react";
import { graphql } from "relay-runtime";
import Relay from "react-relay/hooks";

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

export default function Index()
{
    const [preloadedQuery, loadQuery] = Relay.useQueryLoader<IndexQuery>(query);
    React.useEffect(function () { loadQuery({}); }, []);
    return <Lazy query={query} preloadedQuery={preloadedQuery} />;
}
