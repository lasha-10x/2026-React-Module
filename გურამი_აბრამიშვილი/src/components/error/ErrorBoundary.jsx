import { Component } from "react";
// Error boundaries can only be class components: React has no hook equivalent.
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    // Called while rendering: switches the next render to the fallback UI.
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    // Called after the error: the place for logging.
    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error:", error, info.componentStack);
    }
    render() {
        if (!this.state.hasError)
            return this.props.children;
        return (<div role="alert" className="container-page py-16">
        <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <p className="text-muted">An unexpected error happened while showing this page. Reloading usually fixes it.</p>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-5 font-semibold text-white transition-colors hover:bg-brand-hover focus-ring">
            Reload
          </button>
        </div>
      </div>);
    }
}
