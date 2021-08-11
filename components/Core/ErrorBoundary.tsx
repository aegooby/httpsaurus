
import * as React from "react";

import { Console } from "./Console.tsx";

interface Props 
{
    children?: React.ReactNode;
    fallback: NonNullable<React.ReactNode> | null;
}
interface State { error: Error | undefined; }

export class ErrorBoundary extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = { error: undefined };
    }
    public static getDerivedStateFromError(error: Error): State
    {
        return { error: error };
    }
    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void
    {
        Console.error(error);
        Console.error(errorInfo.componentStack);
    }
    public render(): React.ReactNode
    {
        if (this.state.error)
            return this.props.fallback;

        return this.props.children;
    }
}