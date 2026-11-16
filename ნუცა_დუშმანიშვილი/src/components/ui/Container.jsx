export function Container({ children, className = '' }) {
    return (<div className={`max-w-6xl w-full mx-auto px-4 sm:px-6 ${className}`}>
      {children}
    </div>);
}
