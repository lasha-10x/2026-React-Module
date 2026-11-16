import { Component } from "react";
import MessagePanel from "./MessagePanel";
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error(error, info.componentStack);
    }
    render() {
        if (this.state.hasError) {
            return (<div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-20">
          <MessagePanel variant="error" title="Something went wrong." note="please reload the page"/>
          <button type="button" onClick={() => window.location.reload()} className="h-12 px-7 rounded-full bg-coal text-white text-[17px] font-extrabold transition enabled:hover:bg-blue">
            Reload
          </button>
        </div>);
        }
        return this.props.children;
    }
}
