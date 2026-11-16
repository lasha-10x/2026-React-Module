import { discountedPrice } from "./format";
export const PAGE_SIZE = 12;
/** The shop sells perfume and cosmetics only — these DummyJSON categories. */
export const SHOP_CATEGORIES = ["fragrances", "beauty", "skin-care", "womens-bags", "womens-jewellery", "womens-watches", "sunglasses"];
export function isShopCategory(value) {
    return SHOP_CATEGORIES.includes(value);
}
export const SORT_CHOICES = [
    { value: "", label: "Featured" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
    { value: "rating-desc", label: "Rating: high to low" },
    { value: "title-asc", label: "Name A→Z" },
];
export function isSortOption(value) {
    return SORT_CHOICES.some((choice) => choice.value === value);
}
/** URL → validated params. Anything unknown falls back to a safe default. */
export function parseCatalogParams(searchParams) {
    const q = (searchParams.get("q") ?? "").trim();
    const categoryRaw = searchParams.get("category") ?? "";
    const sortRaw = searchParams.get("sort") ?? "";
    const pageRaw = Number(searchParams.get("page") ?? "1");
    return {
        q,
        category: isShopCategory(categoryRaw) ? categoryRaw : "",
        sort: isSortOption(sortRaw) ? sortRaw : "",
        page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    };
}
/** Pure sort — returns a new array, never mutates the input. Sorts by the price the customer pays. */
export function sortProducts(products, sort) {
    const copy = [...products];
    const finalPrice = (p) => discountedPrice(p.price, p.discountPercentage);
    switch (sort) {
        case "price-asc":
            return copy.sort((a, b) => finalPrice(a) - finalPrice(b));
        case "price-desc":
            return copy.sort((a, b) => finalPrice(b) - finalPrice(a));
        case "rating-desc":
            return copy.sort((a, b) => b.rating - a.rating);
        case "title-asc":
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        case "":
            return copy;
    }
}
/** skip = (page − 1) × size, totalPages = ceil(total / size). Out-of-range pages are clamped. */
export function paginate(list, page, pageSize = PAGE_SIZE) {
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const skip = (safePage - 1) * pageSize;
    const items = list.slice(skip, skip + pageSize);
    return {
        items,
        page: safePage,
        totalPages,
        total,
        from: total === 0 ? 0 : skip + 1,
        to: skip + items.length,
    };
}
