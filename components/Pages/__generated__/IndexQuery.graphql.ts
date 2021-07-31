/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type IndexQueryVariables = {
    id: string;
};
export type IndexQueryResponse = {
    readonly queryUser: {
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
query IndexQuery(
  $id: ID!
) {
  queryUser(id: $id) {
    user {
      id
      email
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "QueryUserResponse",
    "kind": "LinkedField",
    "name": "queryUser",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IndexQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IndexQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "03f3079f93d40db925b7d1abb2366a91",
    "id": null,
    "metadata": {},
    "name": "IndexQuery",
    "operationKind": "query",
    "text": "query IndexQuery(\n  $id: ID!\n) {\n  queryUser(id: $id) {\n    user {\n      id\n      email\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'f5a0d008a8436d695fa2169abb3dde19';
export default node;
