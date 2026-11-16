import React, { Component } from "react";
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (<div className="mx-auto my-20 max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-red-800">Something went wrong.</h1>
          <p className="mt-2 text-sm text-red-600">
            An unexpected error occurred in the application.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 cursor-pointer rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
