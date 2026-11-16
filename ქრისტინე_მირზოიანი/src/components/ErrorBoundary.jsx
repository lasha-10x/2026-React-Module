import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };
    render() {
        if (this.state.hasError) {
            return (<div className="min-h-screen flex items-center justify-center p-6 text-center bg-brand-dark text-white">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8"/>
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-xs text-slate-400 mb-6">
                An unexpected error occurred. Please reload the application.
                </p>
                {this.state.error && (<p className="text-xs font-mono bg-slate-950 p-3 rounded-xl text-rose-400 text-left mb-6 wrap-break-word">
                    {this.state.error.message}
                </p>)}
                <button onClick={this.handleReload} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 text-white font-bold text-xs transition cursor-pointer w-full">
                <RefreshCw className="w-4 h-4"/>
                Reload Page
                </button>
            </div>
            </div>);
        }
        return this.props.children;
    }
}
