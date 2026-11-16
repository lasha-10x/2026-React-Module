import { Component } from "react";
class ErrorBoundary extends Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(_error, _errorInfo) {
        console.error("Application Error:", _error, _errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (<main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Something went wrong.
          </h1>

          <p className="mt-3 text-gray-600">
            An unexpected error occurred. Please try again.
          </p>

          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            Reload page
          </button>
        </main>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
