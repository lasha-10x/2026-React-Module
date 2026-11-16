import { Component } from 'react';
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        // Kept on purpose: this is the one place where a crash is reported.
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (<div role="alert" className="mx-auto mt-16 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-bold text-red-700">Something went wrong.</h1>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300">
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
