
import * as React from "react";

import graphql from "../../../graphql/graphql.tsx";
import { GraphQL } from "../../Core/Core.tsx";
import * as Loading from "../../Loading.tsx";

interface Value
{
    value: string;
}

export default function Login()
{
    Loading.useFinishLoading();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const client = GraphQL.useClient();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void>
    {
        event.preventDefault();
        if (!client) return;

        const query = graphql`
            mutation($user: AddUserInput!) 
            {
                addUser(input: [$user]) { __typename }
            }
        `;
        const variables =
        {
            "user":
            {
                "email": email,
                "password": password
            }
        };
        await client.fetch({ query: query });
    }
    const element =
        <div className="page">
            <div className="form-wrapper">
                <form onSubmit={onSubmit}>
                    <div className="form-item-wrapper">
                        <input
                            type="text" id="email" name="email" required
                            placeholder="email@example.com"
                            onChange={function (event) { setEmail((event.target as (typeof event.target & Value)).value.trim()); }}
                        />
                    </div>
                    <div className="form-item-wrapper">
                        <input
                            type="text" id="password" name="password" required
                            placeholder="password"
                            onChange={function (event) { setPassword((event.target as (typeof event.target & Value)).value.trim()); }}
                        />
                    </div>
                    <div className="form-item-wrapper">
                        <input type="submit" className="button shadow" value="Confirm" />
                    </div>
                </form>
            </div>
            <p className="copyinfo">© 0000 Company, Inc.</p>
        </div>;
    return element;
}
