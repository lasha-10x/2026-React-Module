import Button from "./Button";
export function ErrorMessage({ message, onRetry }) {
    return (<div role="alert" className="card flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-lg font-semibold text-danger">Something went wrong</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry !== undefined && (<Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>)}
    </div>);
}
export function EmptyState({ title, children }) {
    return (<div className="card flex flex-col items-center gap-4 px-4 py-12 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </div>);
}
