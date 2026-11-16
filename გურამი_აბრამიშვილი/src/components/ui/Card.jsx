// Generic container: whatever is placed inside arrives through props.children.
export default function Card({ children, className = "", ...rest }) {
    return (<div className={`card p-4 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>);
}
