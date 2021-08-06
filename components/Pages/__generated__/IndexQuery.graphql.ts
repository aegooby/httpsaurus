// deno-lint-ignore-file
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type IndexQueryVariables = {};
export type IndexQueryResponse = {
    readonly readCurrentUser: {
        readonly user: {
            readonly id: string;
            readonly email: string;
        };
    };
};
export type IndexQuery = {
    readonly response: IndexQueryResponse;
    readonly variables: IndexQueryVariables;
};



/*
query IndexQuery {
  readCurrentUser {
    user {
      id
      email
    }
  }
}
*/

const node: ConcreteRequest = (function ()
{
    var v0 = [
        {
            "alias": null,
            "args": null,
            "concreteType": "ReadUserResponse",
            "kind": "LinkedField",
            "name": "readCurrentUser",
            "plural": false,
            "selections": [
                {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "user",
                    "plural": false,
                    "selections": [
                        {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "id",
                            "storageKey": null
                        },
                        {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "email",
                            "storageKey": null
                        }
                    ],
                    "storageKey": null
                }
            ],
            "storageKey": null
        }
    ];
    return {
        "fragment": {
            "argumentDefinitions": [],
            "kind": "Fragment",
            "metadata": null,
            "name": "IndexQuery",
            "selections": (v0/*: any*/),
            "type": "Query",
            "abstractKey": null
        },
        "kind": "Request",
        "operation": {
            "argumentDefinitions": [],
            "kind": "Operation",
            "name": "IndexQuery",
            "selections": (v0/*: any*/)
        },
        "params": {
            "cacheID": "e709d06b76bbe8ecad021102823ccdd4",
            "id": null,
            "metadata": {},
            "name": "IndexQuery",
            "operationKind": "query",
            "text": "query IndexQuery {\n  readCurrentUser {\n    user {\n      id\n      email\n    }\n  }\n}\n"
        }
    };
})();
(node as any).hash = '79bead89bc0c836e5e71349bd23d75e1';
export default node;
