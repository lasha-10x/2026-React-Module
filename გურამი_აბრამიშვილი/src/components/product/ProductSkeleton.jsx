export function ProductGridSkeleton({ count = 12 }) {
    return (<div role="status" aria-busy="true" aria-label="Loading products">
      <span className="sr-only">Loading products…</span>
      <ul className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6 lg:grid-cols-3 desktop:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (<li key={i} className="card overflow-hidden">
            <div className="skeleton aspect-square rounded-none"/>
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-1/3"/>
              <div className="skeleton h-4 w-5/6"/>
              <div className="skeleton h-5 w-1/2"/>
              <div className="skeleton h-11 w-full"/>
            </div>
          </li>))}
      </ul>
    </div>);
}
export function ProductDetailsSkeleton() {
    return (<div role="status" aria-busy="true" aria-label="Loading product" className="grid gap-8 md:grid-cols-2">
      <span className="sr-only">Loading product…</span>
      <div className="skeleton aspect-square" aria-hidden="true"/>
      <div className="space-y-4" aria-hidden="true">
        <div className="skeleton h-4 w-1/3"/>
        <div className="skeleton h-8 w-4/5"/>
        <div className="skeleton h-6 w-1/4"/>
        <div className="skeleton h-24 w-full"/>
        <div className="skeleton h-11 w-1/2"/>
      </div>
    </div>);
}
