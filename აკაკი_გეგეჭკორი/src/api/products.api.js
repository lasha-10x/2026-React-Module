import { apiClient } from "./ApiClient";
import { buildProductsUrl } from "../utils/url";
export async function fetchProducts(paramsOrLimit = 12, skipOrSignal, maybeSignal) {
    if (typeof paramsOrLimit === "number") {
        const limit = paramsOrLimit;
        const skip = typeof skipOrSignal === "number" ? skipOrSignal : 0;
        const page = Math.floor(skip / limit) + 1;
        const signal = skipOrSignal instanceof AbortSignal ? skipOrSignal : maybeSignal;
        const url = buildProductsUrl({ limit, page });
        return apiClient.get(url, signal);
    }
    const signal = skipOrSignal instanceof AbortSignal ? skipOrSignal : maybeSignal;
    const url = buildProductsUrl(paramsOrLimit);
    return apiClient.get(url, signal);
}
export async function fetchProductById(id, signal) {
    return apiClient.get(`/products/${id}`, signal);
}
export async function fetchCategories(signal) {
    return apiClient.get("/products/categories", signal);
}
export async function fetchRelatedProducts(category, currentProductId, signal) {
    const res = await apiClient.get(`/products/category/${encodeURIComponent(category)}?limit=5`, signal);
    return res.products.filter((p) => p.id !== currentProductId).slice(0, 4);
}
