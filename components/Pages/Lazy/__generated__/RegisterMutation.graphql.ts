// deno-lint-ignore-file
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type UserInfo = {
    email: string;
    password: string;
};
export type RegisterMutationVariables = {
    input: UserInfo;
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
  $input: UserInfo!
) {
  createUser(input: $input) {
    user {
      id
    }
  }
}
*/

const node: ConcreteRequest = (function ()
{
    var v0 = [
        {
            "defaultValue": null,
            "kind": "LocalArgument",
            "name": "input"
        }
    ],
        v1 = [
            {
                "alias": null,
                "args": [
                    {
                        "kind": "Variable",
                        "name": "input",
                        "variableName": "input"
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
            "cacheID": "f6b7d27a7bcb547ae94c7bec1c9445fb",
            "id": null,
            "metadata": {},
            "name": "RegisterMutation",
            "operationKind": "mutation",
            "text": "mutation RegisterMutation(\n  $input: UserInfo!\n) {\n  createUser(input: $input) {\n    user {\n      id\n    }\n  }\n}\n"
        }
    };
})();
(node as any).hash = 'a48114d389795d95c48af78c46a4ff04';
export default node;
