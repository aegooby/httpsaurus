
import * as React from "react";
import Relay from "react-relay/hooks";
import * as ReactRouter from "react-router-dom";

import { graphql } from "relay-runtime";
import { environment, Environment, Console } from "../../Core/Core.tsx";
import * as Loading from "../../Loading.tsx";

interface Value
{
    value: string;
}

export default function Register()
{
    Loading.useFinishLoading();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const mutation = graphql`
            mutation RegisterMutation($email: String!, $password: String!) 
            {
                createUser(email: $email, password: $password) {
                    user {
                        id
                    }
                }
            }
        `;

    const [commit, isInFlight] = Relay.useMutation(mutation);
    const navigate = ReactRouter.useNavigate();

    function onSubmit(event: React.FormEvent<HTMLFormElement>): void
    {
        event.preventDefault();

        switch (environment())
        {
            case Environment.SERVER:
                return;
            case Environment.CLIENT:
                break;
        }


        const variables =
        {
            "email": email,
            "password": password
        };

        const onCompleted = function (data: unknown)
        {
            Console.log(data);
            navigate("/login");
        };

        const onError = function (error: unknown) 
        {
            Console.error(error);
            setEmail("");
            setPassword("");
        };

        commit({ variables: variables, onCompleted: onCompleted, onError: onError });
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
                            value={email}
                        />
                    </div>
                    <div className="form-item-wrapper">
                        <input
                            type="text" id="password" name="password" required
                            placeholder="password"
                            onChange={function (event) { setPassword((event.target as (typeof event.target & Value)).value.trim()); }}
                            value={password}
                        />
                    </div>
                    <div className="form-item-wrapper">
                        <input type="submit" className="button shadow" value="Register" />
                    </div>
                </form>
            </div>
            <p className="copyinfo">© 0000 Company, Inc.</p>
        </div>;
    return element;
}
