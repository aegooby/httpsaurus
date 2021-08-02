
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

let preloadedQuery: Relay.PreloadedQuery<IndexQuery> | undefined = undefined;
const variables = {} as IndexQueryVariables;

export default function Index()
{
    const environment = Relay.useRelayEnvironment();
    preloadedQuery = Relay.loadQuery(environment, query, variables);
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy query={query} preloadedQuery={preloadedQuery} />}
            lazy
        />;
    return element;
}
