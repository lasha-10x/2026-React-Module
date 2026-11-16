export default function PageHeading({ title, children }) {
    return (<div className="mb-6 flex flex-col gap-1">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {children && <div className="text-ink-soft">{children}</div>}
    </div>);
}
