/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type RegisterMutationVariables = {
    email: string;
    password: string;
};
export type RegisterMutationResponse = {
    readonly createUser: {
        readonly user: {
            readonly id: string;
        };
    };
};
export type RegisterMutation = {
    readonly response: RegisterMutationResponse;
    readonly variables: RegisterMutationVariables;
};



/*
mutation RegisterMutation(
  $email: String!
  $password: String!
) {
  createUser(email: $email, password: $password) {
    user {
      id
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "password"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      },
      {
        "kind": "Variable",
        "name": "password",
        "variableName": "password"
      }
    ],
    "concreteType": "CreateUserResponse",
    "kind": "LinkedField",
    "name": "createUser",
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
    "name": "RegisterMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RegisterMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e4c34e550ff6f432a48437b12d80873b",
    "id": null,
    "metadata": {},
    "name": "RegisterMutation",
    "operationKind": "mutation",
    "text": "mutation RegisterMutation(\n  $email: String!\n  $password: String!\n) {\n  createUser(email: $email, password: $password) {\n    user {\n      id\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = 'af122e9991d3c612e7792431fccc484c';
export default node;
