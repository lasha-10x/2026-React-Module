import { Component } from 'react';
import { Button } from './ui/Button';
export class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Unhandled UI error:', error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (<div role="alert" className="mx-auto my-16 max-w-md rounded-2xl border-2 border-neutral-950 bg-red-200 p-8 text-center shadow-[6px_6px_0_0_#0a0a0a]">
          <p data-display className="text-3xl font-extrabold tracking-tight">
            Something went wrong.
          </p>
          <p className="mt-2 text-neutral-800">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <Button variant="dark" className="mt-6" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>);
        }
        return this.props.children;
    }
}
