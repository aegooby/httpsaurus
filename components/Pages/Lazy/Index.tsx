
import * as React from "react";
import Relay from "react-relay/hooks";
import type { IndexQuery, IndexQueryResponse } from "../__generated__/IndexQuery.graphql.ts";

import * as Loading from "../../Loading.tsx";

interface Props
{
    query: Relay.GraphQLTaggedNode;
    preloadedQuery?: Relay.PreloadedQuery<IndexQuery> | undefined;
}
export default function Index(props: Props)
{
    Loading.useFinishLoading();

    let data: IndexQueryResponse | undefined = undefined;
    if (props.preloadedQuery)
    {
        try { data = Relay.usePreloadedQuery(props.query, props.preloadedQuery) as IndexQueryResponse; }
        catch { undefined; }
    }

    const element =
        <div className="page">
            <p className="logo">
                <img src="/logo.webp" height={304} width={256} alt="logo" />
            </p>
            <h1><strong>https</strong>aurus</h1>
            <h2>React v{React.version}</h2>
            <h3>{data ? <>Logged in as <strong>{data.readCurrentUser.user.email}</strong></> : <>Not logged in</>}</h3>
            <p className="copyinfo">© 0000 Company, Inc.</p>
        </div>;
    return element;
}
