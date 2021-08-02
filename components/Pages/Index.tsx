
import * as React from "react";
import { graphql } from "relay-runtime";
import Relay from "react-relay/hooks";

const Lazy = React.lazy(() => import("./Lazy/Index.tsx"));
import Page from "../Page.tsx";
import type { IndexQuery, IndexQueryVariables } from "./__generated__/IndexQuery.graphql.ts";

const query = graphql`
        query IndexQuery {
            readCurrentUser {
                user {
                    id
                    email
                }
            }
        }
    `;

export default function Index()
{
    const [preloadedQuery, loadQuery] = Relay.useQueryLoader<IndexQuery>(query);
    React.useEffect(function () { loadQuery({}); }, []);
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy query={query} preloadedQuery={preloadedQuery} />}
            lazy
        />;
    return element;
}
