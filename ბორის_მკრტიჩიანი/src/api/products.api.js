import { apiClient } from "./ApiClient";
export function isProduct(value) {
    if (typeof value !== "object" || value === null)
        return false;
    const candidate = value;
    return (typeof candidate.id === "number" &&
        typeof candidate.title === "string" &&
        typeof candidate.price === "number" &&
        typeof candidate.discountPercentage === "number" &&
        typeof candidate.stock === "number" &&
        typeof candidate.thumbnail === "string");
}
export async function fetchProducts(limit = 0, skip = 0, signal) {
    return apiClient.get(`/products?limit=${limit}&skip=${skip}`, signal);
}
export async function fetchProductById(id, signal) {
    return apiClient.get(`/products/${id}`, signal);
}
export async function fetchCategories(signal) {
    return apiClient.get("/products/categories", signal);
}
export async function fetchProductsByCategory(slug, limit = 0, signal) {
    return apiClient.get(`/products/category/${encodeURIComponent(slug)}?limit=${limit}`, signal);
}
