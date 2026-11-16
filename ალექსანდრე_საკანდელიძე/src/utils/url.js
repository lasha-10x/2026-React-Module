/**
 * NOTE: the rules for the catalog's URL, as plain functions with no React in them.
 * Why it exists: search, category, sort and page live in the URL (PRD P2.8), so refresh, Back/Forward and
 * shared links all just work. Keeping the rules here means they can be read and tested in one place.
 * Connects to: `useCatalogParams` calls these, and `CatalogPage` uses what comes out.
 */
import { PAGE_SIZE, SORT_OPTIONS } from "./constants";
/** A type guard: is this text one of our sort values? The URL can hold anything, because anyone can edit it. */
export function isSortValue(value) {
    return SORT_OPTIONS.some((option) => option.value === value);
}
/** True for a price like 10 or 9.99. A regex, because Number("1e3") would count as 1000 and Number("") as 0. */
export function isPriceText(text) {
    return /^\d+(\.\d{1,2})?$/.test(text);
}
/** Reads a price from the URL, where anything else counts as no limit. */
function parsePrice(text) {
    return text !== null && isPriceText(text) ? Number(text) : null;
}
/** True when the catalog has a price range. `Pick` lets a caller pass just these two values. */
export function hasPriceRange({ min, max }) {
    return min !== null || max !== null;
}
/**
 * Reads the URL into typed values. Anything nonsense falls back to the default instead of breaking the page.
 * A hand-written URL could hold both `q` and `category`, but the API can't combine them, so the search wins.
 * The page uses a regex because Number("1e3") would count as page 1000.
 */
export function parseCatalogParams(searchParams) {
    const q = (searchParams.get("q") ?? "").trim();
    const sort = searchParams.get("sort") ?? "";
    const pageText = searchParams.get("page") ?? "";
    const page = /^[1-9]\d*$/.test(pageText) ? Number(pageText) : 1;
    const low = parsePrice(searchParams.get("min"));
    const high = parsePrice(searchParams.get("max"));
    // A range written backwards still has a clear meaning, so it is read the right way round.
    const isReversed = low !== null && high !== null && low > high;
    // A price range needs the whole list in the browser, and Endless exists to avoid that, so the two don't combine. A
    // hand-written URL with both gets the range. Endless also ignores `page`, because it always starts from the top.
    const isEndless = searchParams.get("mode") === "endless" && low === null && high === null;
    return {
        q,
        category: q === "" ? (searchParams.get("category") ?? "") : "",
        sort: isSortValue(sort) ? sort : "",
        page: !isEndless && Number.isSafeInteger(page) ? page : 1,
        view: searchParams.get("view") === "list" ? "list" : "grid",
        mode: isEndless ? "endless" : "pages",
        min: isReversed ? high : low,
        max: isReversed ? low : high,
    };
}
/** The catalog with every filter gone. The view and the mode aren't filters, so they stay as chosen. */
export function clearedFiltersPath({ view, mode }) {
    const query = new URLSearchParams();
    if (view === "list") {
        query.set("view", "list");
    }
    if (mode === "endless") {
        query.set("mode", "endless");
    }
    const text = query.toString();
    return text === "" ? "/" : `/?${text}`;
}
/** Sets a parameter, or removes it when empty, so a clean catalog has a clean URL. */
function setOrDelete(searchParams, key, value) {
    if (value === "") {
        searchParams.delete(key);
    }
    else {
        searchParams.set(key, value);
    }
}
/**
 * The next URL for a change (PRD P2.8). The API can't search inside a category, so those two clear each
 * other, and any filter change goes back to page 1, because the old page number may not exist any more.
 * It builds a new object, so it never changes the one it was given.
 */
export function nextSearchParams(current, change) {
    const next = new URLSearchParams(current);
    switch (change.type) {
        case "search":
            // Trimmed here so the URL holds what is really searched, and spaces alone count as no search.
            setOrDelete(next, "q", change.q.trim());
            next.delete("category");
            next.delete("page");
            break;
        case "category":
            setOrDelete(next, "category", change.category);
            next.delete("q");
            next.delete("page");
            break;
        case "sort":
            setOrDelete(next, "sort", change.sort);
            next.delete("page");
            break;
        case "page":
            setOrDelete(next, "page", change.page > 1 ? String(change.page) : "");
            break;
        case "view":
            // Unlike a filter, this keeps the page: the same products are just drawn differently.
            setOrDelete(next, "view", change.view === "list" ? "list" : "");
            break;
        case "mode":
            // A page number means nothing in Endless, and coming back to Pages starts from the top, like any new view of the list.
            setOrDelete(next, "mode", change.mode === "endless" ? "endless" : "");
            next.delete("page");
            break;
        case "price":
            setOrDelete(next, "min", change.min);
            setOrDelete(next, "max", change.max);
            next.delete("page");
            // The two don't combine, as `parseCatalogParams` explains, so the page says Endless is off while a range is set.
            // The old range counts too: a shared link can hold both, and clearing its range mustn't switch Endless on by surprise.
            if (change.min !== "" || change.max !== "" || hasPriceRange(parseCatalogParams(current))) {
                next.delete("mode");
            }
            break;
    }
    return next;
}
/** The fields a product card needs. The API always includes the id. */
const CARD_FIELDS = "title,price,discountPercentage,rating,stock,thumbnail,category,brand";
/**
 * Builds the API path for what the catalog is showing. URLSearchParams and encodeURIComponent make sure a
 * search for "50% & up" can't break the URL. Sorting works on all three endpoints, which was tested live.
 */
export function buildProductsUrl(params) {
    return productsPath(params, new URLSearchParams({ limit: String(PAGE_SIZE), skip: String((params.page - 1) * PAGE_SIZE) }));
}
/**
 * One chunk for Endless, from wherever its list has reached. Only the fields a card needs, because Endless can end up
 * holding every product in memory, and these leave out each product's description, reviews and photos.
 */
export function buildChunkUrl(params, skip) {
    return productsPath(params, new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip), select: CARD_FIELDS }));
}
/**
 * The same path for the whole list, with only the fields a card needs: `limit=0` means "all" to this API, and `select`
 * leaves out descriptions, reviews and photos. Search and category still apply, because those the API can do itself.
 */
export function buildFullListUrl(params) {
    return productsPath(params, new URLSearchParams({ limit: "0", select: CARD_FIELDS }));
}
/** Adds the sort and chooses the right endpoint. The two functions above differ only in how much they ask for. */
function productsPath(params, query) {
    const sortOption = SORT_OPTIONS.find((option) => option.value === params.sort);
    if (sortOption && "sortBy" in sortOption) {
        query.set("sortBy", sortOption.sortBy);
        query.set("order", sortOption.order);
    }
    if (params.q !== "") {
        query.set("q", params.q);
        return `/products/search?${query}`;
    }
    if (params.category !== "") {
        return `/products/category/${encodeURIComponent(params.category)}?${query}`;
    }
    return `/products?${query}`;
}
