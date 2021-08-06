
import * as React from "react";

export function Spinner()
{
    const element =
        <div className="load-spinner-wrapper">
            <div className="load-spinner">
                <div className="inner one"></div>
                <div className="inner two"></div>
                <div className="inner three"></div>
            </div>
        </div>;
    return element;
}