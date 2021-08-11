
import * as React from "react";

interface Props
{
    code: number;
    text: string;
}

export default function Error(props: Props)
{
    const element: React.ReactElement =
        <div className="page">
            <h1><strong>{props.code}</strong> {props.text}</h1>
        </div>;
    return element;
}