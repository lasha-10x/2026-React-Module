export function EmptyState({ title, children }) {
    return (<div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-medium text-slate-900">{title}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>);
}
