import { Component } from 'react';
class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (<div className="mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <p className="mt-2">
            This page hit an unexpected error. Try reloading, or go back home.
          </p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
