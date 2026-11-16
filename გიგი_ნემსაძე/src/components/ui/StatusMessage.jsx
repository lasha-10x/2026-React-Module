export default function StatusMessage({ children, role }) {
    return (<p role={role} className={`rounded-sm border border-dashed px-6 py-16 text-center text-lg ${role === 'alert' ? 'border-red-700/40 text-red-700' : 'border-wine-900/20 text-wine-950/60'}`}>
      {children}
    </p>);
}
