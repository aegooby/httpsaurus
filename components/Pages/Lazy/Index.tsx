
import * as React from "react";
import Relay from "react-relay/hooks";
import type { IndexQuery, IndexQueryResponse } from "../__generated__/IndexQuery.graphql.ts";

import { Suspense } from "../../Core/Core.tsx";

interface Props
{
    query: Relay.GraphQLTaggedNode;
    preloadedQuery?: Relay.PreloadedQuery<IndexQuery> | null | undefined;
}

function LoginInfo(props: Props)
{
    let data: IndexQueryResponse | undefined = undefined;
    if (props.preloadedQuery)
        data = Relay.usePreloadedQuery(props.query, props.preloadedQuery);
    const element: React.ReactElement =
        data && data.readCurrentUser ?
            <h3>Logged in as <strong>{data.readCurrentUser.email}</strong></h3> :
            <h3>Not logged in</h3>;
    return element;
}

export default function Index(props: Props)
{
    const element =
        <div className="page">
            <p>
                <img src="/logo.webp" height={304} width={256} alt="logo" />
            </p>
            <h1><strong>https</strong>aurus</h1>
            <h2>React v{React.version}</h2>
            <Suspense fallback={<h3>Not logged in</h3>}>
                <LoginInfo {...props} />
            </Suspense>
            <p className="copyinfo">© 0000 Company, Inc.</p>
        </div>;
    return element;
}
