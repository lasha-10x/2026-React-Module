import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CATEGORIES_PATH } from "@/api/endpoints";
import ProductGrid from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import PageHeading from "@/components/ui/PageHeading";
import { SelectField } from "@/components/ui/TextField";
import SearchBox from "@/components/product/SearchBox";
import { EmptyState, ErrorMessage } from "@/components/ui/StatusMessage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFetch } from "@/hooks/useFetch";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { parseCatalogParams, isSortOption, parseViewMode } from "@/utils/catalogParams";
import { PAGE_SIZE, SORT_OPTIONS } from "@/utils/constants";
import { ensureSorted } from "@/utils/sort";
import { buildProductsUrl } from "@/utils/url";
export default function CatalogPage() {
    useDocumentTitle("Catalog");
    const [searchParams, setSearchParams] = useSearchParams();
    const addToCart = useAddToCart();
    const searchHistory = useSearchHistory();
    // The URL is the single source of truth for q / category / sort / page / view.
    const params = useMemo(() => parseCatalogParams(searchParams), [searchParams]);
    const view = parseViewMode(searchParams);
    const products = useFetch(buildProductsUrl(params));
    const categories = useFetch(CATEGORIES_PATH);
    function updateParams(patch, replace = false) {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(patch)) {
                if (value === null || value === undefined || value === "")
                    next.delete(key);
                else
                    next.set(key, value);
            }
            return next;
        }, { replace });
    }
    // ----- Search: local state keeps typing instant; the URL follows 400 ms after the last keystroke -----
    const [searchText, setSearchText] = useState(params.q);
    const debouncedText = useDebounce(searchText, 400);
    useEffect(() => {
        const trimmed = debouncedText.trim();
        if (trimmed !== params.q) {
            updateParams({ q: trimmed, category: null, page: null }, true);
            searchHistory.add(trimmed); // empty text is ignored by add()
        }
        // updateParams only wraps setSearchParams; we intentionally react to the debounced text alone.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedText]);
    // Back/Forward or "Clear filters" changed ?q: bring the input in line with the URL.
    useEffect(() => {
        setSearchText((current) => (current.trim() === params.q ? current : params.q));
    }, [params.q]);
    // ----- Rendering -----
    const totalPages = products.state.status === "success" ? Math.ceil(products.state.data.total / PAGE_SIZE) : 0;
    const hasFilters = params.q !== "" || params.category !== "" || params.sort !== "";
    function handlePageChange(page) {
        updateParams({ page: page <= 1 ? null : String(page) });
        window.scrollTo(0, 0);
    }
    let content;
    if (products.state.status === "loading" || products.state.status === "idle") {
        content = <ProductGridSkeleton count={PAGE_SIZE}/>;
    }
    else if (products.state.status === "error") {
        content = <ErrorMessage message={products.state.message} onRetry={products.retry}/>;
    }
    else {
        const { data } = products.state;
        const list = ensureSorted(data.products, params.sort);
        const from = data.skip + 1;
        const to = data.skip + list.length;
        content =
            list.length === 0 ? (<EmptyState title="No products found.">
          <Link to="/" className="rounded font-semibold text-accent underline focus-ring">
            Clear filters
          </Link>
        </EmptyState>) : (<>
          <ProductGrid products={list} onAdd={(p) => addToCart(p)} layout={view}/>
          <Pagination page={params.page} totalPages={totalPages} onChange={handlePageChange}/>
          <p className="mt-4 text-center text-sm text-muted">
            Showing {from}–{to} of {data.total}
          </p>
        </>);
    }
    const total = products.state.status === "success" ? products.state.data.total : null;
    return (<div>
      <PageHeading title="Catalog" subtitle={total === null ? "Loading products…" : `${total} products`}/>

      {/* Toolbar */}
      {/* One row from tablet width up: search grows, category / sort have a fixed width, the layout switch sits at the end.
            Below that the items wrap onto the next line. items-start + the pt-6 spacer (= label height) keeps the
            switch level with the inputs, not with the reserved error line under them. */}
      <div className="card mb-6 flex flex-wrap items-start gap-3 p-4 md:flex-nowrap">
        <div className="min-w-0 flex-[1_1_100%] sm:flex-[1_1_16rem]">
          <SearchBox value={searchText} onChange={setSearchText} history={searchHistory.history} onRemoveHistory={searchHistory.remove} onClearHistory={searchHistory.clear}/>
        </div>
        <div className="min-w-0 flex-[1_1_8rem] md:w-48 md:flex-none">
          <SelectField label="Category" value={params.category} onChange={(e) => updateParams({ category: e.target.value, q: null, page: null })} disabled={categories.state.status !== "success"}>
            <option value="">All categories</option>
            {categories.state.status === "success" &&
            categories.state.data.map((c) => (<option key={c.slug} value={c.slug}>
                  {c.name}
                </option>))}
          </SelectField>
        </div>
        <div className="min-w-0 flex-[1_1_8rem] md:w-48 md:flex-none">
          <SelectField label="Sort by" value={params.sort} onChange={(e) => {
            const value = e.target.value;
            updateParams({ sort: isSortOption(value) ? value : "", page: null });
        }}>
            {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>
                {o.label}
              </option>))}
          </SelectField>
        </div>

        {/* BONUS: grid / list switch, stored in the URL as ?view=list */}
        <div className="flex shrink-0 gap-2 pt-6" role="group" aria-label="Layout">
          <Button variant={view === "grid" ? "primary" : "secondary"} aria-pressed={view === "grid"} onClick={() => updateParams({ view: null })}>
            Grid
          </Button>
          <Button variant={view === "list" ? "primary" : "secondary"} aria-pressed={view === "list"} onClick={() => updateParams({ view: "list" })}>
            List
          </Button>
        </div>
      </div>

      {hasFilters && (<p className="mb-4 text-sm text-muted">
          Filters applied.{" "}
          <Link to="/" className="rounded font-semibold text-accent underline focus-ring">
            Clear filters
          </Link>
        </p>)}

      {content}
    </div>);
}
