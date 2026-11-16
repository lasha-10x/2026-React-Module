import { ApiError, isApiError } from "../errors/ApiError";
const API_URL = "https://dummyjson.com/products";
async function fetchJson(url, errorMessage, signal) {
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new ApiError(`${errorMessage} (HTTP ${response.status})`, response.status);
        }
        return (await response.json());
    }
    catch (error) {
        if (isApiError(error)) {
            // HTTP errors retain their original message and status.
            throw error;
        }
        // Preserve AbortError, network errors and other failures.
        throw error;
    }
}
export function buildProductsUrl(params) {
    const { page, limit, search, category, sort } = params;
    const skip = (page - 1) * limit;
    let url = API_URL;
    if (search.trim()) {
        url += "/search";
    }
    else if (category !== "all") {
        url += `/category/${encodeURIComponent(category)}`;
    }
    const query = new URLSearchParams({
        limit: String(limit),
        skip: String(skip),
    });
    if (search.trim()) {
        query.set("q", search.trim());
    }
    switch (sort) {
        case "price-asc":
            query.set("sortBy", "price");
            query.set("order", "asc");
            break;
        case "price-desc":
            query.set("sortBy", "price");
            query.set("order", "desc");
            break;
        case "rating-desc":
            query.set("sortBy", "rating");
            query.set("order", "desc");
            break;
        case "title-asc":
            query.set("sortBy", "title");
            query.set("order", "asc");
            break;
        default:
            break;
    }
    return `${url}?${query.toString()}`;
}
export async function getProducts(params = {
    page: 1,
    limit: 12,
    search: "",
    category: "all",
    sort: "default",
}, signal) {
    return fetchJson(buildProductsUrl(params), "Failed to fetch products", signal);
}
export async function getCategories(signal) {
    return fetchJson(`${API_URL}/category-list`, "Failed to fetch categories", signal);
}
export async function getProductById(id, signal) {
    return fetchJson(`${API_URL}/${encodeURIComponent(id)}`, "Failed to fetch product", signal);
}
export async function getRelatedProducts(category, currentProductId, signal) {
    const data = await fetchJson(`${API_URL}/category/${encodeURIComponent(category)}?limit=5`, "Failed to fetch related products", signal);
    return data.products
        .filter((product) => product.id !== currentProductId)
        .slice(0, 4);
}
