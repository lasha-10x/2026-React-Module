import { Component } from "react";
/**
 * ErrorBoundary - catches unexpected JavaScript runtime errors in the React tree
 * and presents a graceful tactile WOODWORK recovery screen.
 */
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an unexpected error:", error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    handleReturnHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };
    render() {
        if (this.state.hasError) {
            return (<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="tactile-card mx-auto max-w-md rounded-2xl p-8">
            <div className="wood-btn mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl mb-4">
              ⚠️
            </div>
            <h1 className="font-editorial text-xl font-extrabold tracking-tight text-[#26170C] dark:text-[#F5EBE0]">
              Something went wrong.
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5C4938] dark:text-[#D8C2A8]">
              An unexpected atelier error occurred. You can reload the page or return to the collection.
            </p>
            {this.state.error && (<p className="mt-3 rounded-lg bg-[#EFE8DC] p-2.5 text-left font-mono text-[11px] text-[#26170C] dark:bg-[#19100A] dark:text-[#F5EBE0] overflow-x-auto">
                {this.state.error.message}
              </p>)}
            <div className="mt-6 flex gap-2.5 justify-center">
              <button type="button" onClick={this.handleReload} className="wood-btn rounded-lg px-4 py-2 text-xs">
                Reload
              </button>
              <button type="button" onClick={this.handleReturnHome} className="wood-btn-walnut rounded-lg px-4 py-2 text-xs">
                Return to Shop
              </button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
