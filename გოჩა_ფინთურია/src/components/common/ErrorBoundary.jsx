import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8"/>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 text-sm">
            An unexpected error occurred while rendering this part of the shop. You can reload the page to restore state.
          </p>
          <button onClick={this.handleReload} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <RefreshCw className="w-4 h-4"/>
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
