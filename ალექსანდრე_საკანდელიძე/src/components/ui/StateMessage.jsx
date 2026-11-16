export default function StateMessage({ title, role = "status", children }) {
    return (<div role={role} className="grid justify-items-start gap-3 rounded-[10px] bg-steel-raised p-6 shadow-[inset_0_0_0_1px_var(--edge)]">
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </div>);
}
