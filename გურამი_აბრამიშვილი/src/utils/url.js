import { PAGE_SIZE } from "./constants";
const SORT_QUERY = {
    "price-asc": { sortBy: "price", order: "asc" },
    "price-desc": { sortBy: "price", order: "desc" },
    "rating-desc": { sortBy: "rating", order: "desc" },
    "title-asc": { sortBy: "title", order: "asc" },
};
// Search and category are mutually exclusive (DummyJSON limitation): search wins.
export function buildProductsUrl(params) {
    const query = new URLSearchParams();
    query.set("limit", String(PAGE_SIZE));
    query.set("skip", String((params.page - 1) * PAGE_SIZE));
    if (params.sort !== "") {
        const { sortBy, order } = SORT_QUERY[params.sort];
        query.set("sortBy", sortBy);
        query.set("order", order);
    }
    if (params.q !== "") {
        query.set("q", params.q);
        return `/products/search?${query.toString()}`;
    }
    if (params.category !== "") {
        return `/products/category/${encodeURIComponent(params.category)}?${query.toString()}`;
    }
    return `/products?${query.toString()}`;
}
