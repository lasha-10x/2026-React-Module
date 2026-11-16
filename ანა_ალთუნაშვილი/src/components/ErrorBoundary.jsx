import { Component } from 'react';
/**
 * Error boundaries must be classes: there is no hook for getDerivedStateFromError.
 * A crash while rendering a child shows the fallback instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Unhandled UI error:', error, info.componentStack);
    }
    componentDidUpdate(previous) {
        if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }
    render() {
        if (!this.state.hasError)
            return this.props.children;
        return (<div role="alert" className="mx-auto max-w-lg rounded-2xl border border-danger/40 bg-danger-soft p-8 text-center">
        <h2 className="text-xl font-semibold text-danger">Something went wrong.</h2>
        <p className="mt-2 text-ink">The page hit an unexpected error. Reloading usually fixes it.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          Reload
        </button>
      </div>);
    }
}
