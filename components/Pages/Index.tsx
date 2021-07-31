
import * as React from "react";
import { graphql } from "relay-runtime";
import Relay from "react-relay/hooks";
import * as ReactRouter from "react-router-dom";
import type { IndexQuery, IndexQueryVariables } from "./__generated__/IndexQuery.graphql.ts";

const Lazy = React.lazy(() => import("./Lazy/Index.tsx"));
import Page from "../Page.tsx";

const query = graphql`
        query IndexQuery($id: ID!) {
            queryUser(id: $id) {
                user {
                    id
                    email
                }
            }
        }
    `;

export default function Index()
{
    const state = ReactRouter.useLocation().state;
    let preloadedQuery: Relay.PreloadedQuery<IndexQuery> | undefined = undefined;
    if (state)
    {
        const variables = state as IndexQueryVariables;
        const environment = Relay.useRelayEnvironment();
        preloadedQuery = Relay.loadQuery(environment, query, variables);
    }
    const element: React.ReactElement =
        <Page
            helmet={<title>httpsaurus</title>}
            content={<Lazy query={query} preloadedQuery={preloadedQuery} />}
            lazy
        />;
    return element;
}
