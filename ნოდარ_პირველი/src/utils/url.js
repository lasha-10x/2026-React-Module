export const PAGE_SIZE = 12;
// select-ისთვის: მნიშვნელობა + UI ტექსტი (PRD P2.6)
export const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating-desc", label: "Rating: high to low" },
    { value: "title-asc", label: "Name A→Z" },
];
// type guard: URL-იდან ნებისმიერი სტრიქონი შეიძლება მოვიდეს (?sort=blabla),
// ამიტომ ვამოწმებთ, რომ ის ჩვენი ვარიანტებიდანაა
export function isSortOption(value) {
    return SORT_OPTIONS.some((option) => option.value === value);
}
// Exclude: SortOption '' -ის გარეშე. Record: ყოველ ვარიანტს თავისი API პარამეტრები
const SORT_QUERY = {
    "price-asc": { sortBy: "price", order: "asc" },
    "price-desc": { sortBy: "price", order: "desc" },
    "rating-desc": { sortBy: "rating", order: "desc" },
    "title-asc": { sortBy: "title", order: "asc" },
};
// URL → ტიპიზებული პარამეტრები. არავალიდური მნიშვნელობები default-ით იცვლება
export function parseCatalogParams(searchParams) {
    const sort = searchParams.get("sort") ?? "";
    const page = Number(searchParams.get("page")); // null → 0, "abc" → NaN
    return {
        q: searchParams.get("q")?.trim() ?? "",
        category: searchParams.get("category") ?? "",
        sort: isSortOption(sort) ? sort : "",
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}
// პარამეტრები → API-ს მისამართი (PRD T3)
export function buildProductsUrl({ q, category, sort, page, }) {
    // ძებნა და კატეგორია ურთიერთგამომრიცხავია (API-ს შეზღუდვა): ძებნას აქვს უპირატესობა
    let path = "/products";
    if (q)
        path = "/products/search";
    else if (category)
        path = `/products/category/${encodeURIComponent(category)}`;
    const query = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: String((page - 1) * PAGE_SIZE), // PRD: skip = (page − 1) × limit
    });
    if (q)
        query.set("q", q);
    if (sort) {
        query.set("sortBy", SORT_QUERY[sort].sortBy);
        query.set("order", SORT_QUERY[sort].order);
    }
    return `${path}?${query.toString()}`;
}
