export default function Eyebrow({ children, className = '' }) {
    return <p className={`font-sans text-xs font-bold tracking-widest uppercase ${className}`}>{children}</p>;
}
