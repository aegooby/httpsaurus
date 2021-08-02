
import * as React from "react";
import Relay from "react-relay/hooks";
import type { IndexQuery, IndexQueryResponse } from "../__generated__/IndexQuery.graphql.ts";

import { Suspense } from "../../Core/Core.tsx";
import * as Loading from "../../Loading.tsx";

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
        <h3>
            {
                data ?
                    <>Logged in as <strong>{data.readCurrentUser.user.email}</strong></> :
                    <>Not logged in</>
            }
        </h3>;
    return element;
}

export default function Index(props: Props)
{
    Loading.useFinishLoading();

    const element =
        <div className="page">
            <div>
                <img src="/logo.webp" height={304} width={256} alt="logo" />
            </div>
            <h1><strong>https</strong>aurus</h1>
            <h2>React v{React.version}</h2>
            <Suspense fallback={<>Not logged in</>}>
                <LoginInfo {...props} />
            </Suspense>
            <p className="copyinfo">© 0000 Company, Inc.</p>
        </div>;
    return element;
}
