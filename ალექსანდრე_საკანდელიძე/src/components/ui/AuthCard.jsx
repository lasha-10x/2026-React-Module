export default function AuthCard({ title, children }) {
    return (<section className="flex justify-center p-3.5 tablet:p-6">
      <div className="grid w-full max-w-[420px] gap-4 rounded-[10px] bg-steel-raised p-5 shadow-[inset_0_0_0_1px_var(--edge)]">
        <h1 className="text-3xl leading-tight font-bold">{title}</h1>
        {children}
      </div>
    </section>);
}
/** A quiet link under a form. `min-h-11` keeps it at the spec's 44px tap size. */
export const authLinkStyles = "inline-flex min-h-11 items-center font-semibold text-ink-soft hover:text-ink hover:underline";
