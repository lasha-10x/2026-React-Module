/**
 * The title row every screen opens with.
 *
 * Each page owns exactly one <h1>, which is what lets a screen reader (and a
 * reader) tell immediately which page they are on (Annex A, O3).
 */
export default function PageHeader({ title, description, children }) {
    return (<div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description ? (<p className="mt-1 text-sm text-subtle">{description}</p>) : null}
      </div>
      {children ? (<div className="flex w-full items-center gap-2 sm:w-auto">{children}</div>) : null}
    </div>);
}
