/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type IndexQueryVariables = {};
export type IndexQueryResponse = {
    readonly readCurrentUser: {
        readonly id: string;
        readonly email: string;
    } | null;
};
export type IndexQuery = {
    readonly response: IndexQueryResponse;
    readonly variables: IndexQueryVariables;
};



/*
query IndexQuery {
  readCurrentUser {
    id
    email
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "readCurrentUser",
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
    "cacheID": "68d43eb5971ca02d6f3e7475eb9cdddf",
    "id": null,
    "metadata": {},
    "name": "IndexQuery",
    "operationKind": "query",
    "text": "query IndexQuery {\n  readCurrentUser {\n    id\n    email\n  }\n}\n"
  }
};
})();
(node as any).hash = 'ad7f8fb818f9271980e4f528ac91ca97';
export default node;
