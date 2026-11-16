// 1 … 4 5 6 … 20   (first, last, and a window around the current page)
function buildItems(page, totalPages) {
    const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
    const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const items = [];
    pages.forEach((p, i) => {
        if (i > 0 && p - pages[i - 1] > 1)
            items.push(i === 1 ? "gap-left" : "gap-right");
        items.push(p);
    });
    return items;
}
const pageBtn = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors focus-ring " +
    "disabled:cursor-not-allowed disabled:opacity-40";
export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1)
        return null;
    return (<nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={`${pageBtn} border-line bg-surface hover:bg-surface-2 disabled:hover:bg-surface`} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        ‹
      </button>
      {buildItems(page, totalPages).map((item) => typeof item === "number" ? (<button key={item} type="button" onClick={() => onChange(item)} aria-current={item === page ? "page" : undefined} aria-label={`Page ${item}`} className={`${pageBtn} ${item === page ? "border-brand bg-brand text-white" : "border-line bg-surface hover:bg-surface-2"}`}>
            {item}
          </button>) : (<span key={item} className="px-1 text-muted" aria-hidden="true">
            …
          </span>))}
      <button type="button" className={`${pageBtn} border-line bg-surface hover:bg-surface-2 disabled:hover:bg-surface`} onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        ›
      </button>
    </nav>);
}
