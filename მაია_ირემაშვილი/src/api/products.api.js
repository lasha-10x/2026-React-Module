import { api } from "./ApiClient";
import { isApiError } from "./ApiError";
const SORT_RULES = {
    "price-asc": { sortBy: "price", order: "asc" },
    "price-desc": { sortBy: "price", order: "desc" },
    "rating-desc": { sortBy: "rating", order: "desc" },
    "title-asc": { sortBy: "title", order: "asc" },
    newest: { sortBy: "id", order: "desc" },
    "discount-desc": { sortBy: "discountPercentage", order: "desc" },
};
export function getProducts(query, signal) {
    const params = new URLSearchParams({
        limit: String(query.limit),
        skip: String((query.page - 1) * query.limit),
    });
    let path = "/products";
    if (query.search) {
        path = "/products/search";
        params.set("q", query.search);
    }
    else if (query.category) {
        path = `/products/category/${encodeURIComponent(query.category)}`;
    }
    const rule = SORT_RULES[query.sort];
    if (rule) {
        params.set("sortBy", rule.sortBy);
        params.set("order", rule.order);
    }
    return api.get(`${path}?${params.toString()}`, signal);
}
export function getCategories(signal) {
    return api.get("/products/categories", signal);
}
// ერთი პროდუქტი id-ით. 404-ზე აბრუნებს null-ს, სხვა შეცდომას გადასცემს ზემოთ
export async function getProductById(id) {
    try {
        return await api.get(`/products/${id}`);
    }
    catch (error) {
        if (isApiError(error) && error.status === 404) {
            return null;
        }
        throw error;
    }
}
