export default function EmptyState({ title, description, children }) {
    return (<div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 text-muted">{description}</p>}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>);
}
