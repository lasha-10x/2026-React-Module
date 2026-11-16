import { Component } from 'react';
/**
 * O2 — catches render errors anywhere below it and shows a fallback instead
 * of a blank white page. Error boundaries must be class components: there is
 * no hook equivalent of getDerivedStateFromError / componentDidCatch.
 */
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (<div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-powder p-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Something went wrong.</h1>
          <p className="text-ink-soft">Reload the page to continue shopping. Your cart is saved.</p>
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-full bg-berry px-5 font-semibold text-white hover:bg-berry-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry">
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
