import { Component } from 'react';
import { Button } from './ui/Button';
export class ErrorBoundary extends Component {
    state = { hasError: false, errorMessage: '' };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        this.setState({ errorMessage: `${error.name}: ${error.message} (${info.componentStack ?? ''})` });
    }
    render() {
        if (this.state.hasError) {
            return (<main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-16">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong.</h1>
          <p className="text-slate-700">
            The page could not be displayed. Reload to try again.
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
          {this.state.errorMessage ? (<details className="w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-800">
                Technical details
              </summary>
              <p className="mt-2 break-words">{this.state.errorMessage}</p>
            </details>) : null}
        </main>);
        }
        return this.props.children;
    }
}
