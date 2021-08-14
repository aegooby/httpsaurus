
import * as React from "react";
import * as ReactHelmet from "react-helmet";

interface Props
{
    code: number;
    text: string;
}

export function Helmet(props: Props)
{
    const element: React.ReactElement =
        <ReactHelmet.Helmet>
            <title>turtle | {props.text}</title>
        </ReactHelmet.Helmet>;
    return element;
}

export function Page(props: Props)
{
    const element: React.ReactElement =
        <div className="page">
            <h1><strong>{props.code}</strong> {props.text}</h1>
        </div>;
    return element;
}