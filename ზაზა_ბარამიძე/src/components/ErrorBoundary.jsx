import { Component } from 'react';
import Button from './Button';
class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Unhandled UI error:', error, info.componentStack);
    }
    handleReset = () => {
        this.setState({ hasError: false });
    };
    render() {
        if (this.state.hasError) {
            return (<div className='mx-auto max-w-md space-y-4 px-4 py-24 text-center'>
          <h1 className='text-2xl font-semibold'>Something went wrong</h1>
          <p className='text-neutral-600'>An unexpected error occurred. Please try again.</p>
          <Button onClick={this.handleReset}>Try again</Button>
        </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
