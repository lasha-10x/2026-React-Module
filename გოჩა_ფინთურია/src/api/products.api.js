import { apiClient } from "./ApiClient.js";
import { buildProductsUrl } from "../utils/url.js";
export async function fetchProducts(params, signal) {
    const url = buildProductsUrl(params);
    return apiClient.get(url, signal);
}
export async function fetchProductById(id, signal) {
    return apiClient.get(`/products/${id}`, signal);
}
export async function fetchCategories(signal) {
    const data = await apiClient.get("/products/categories", signal);
    return data.map((item) => {
        if (typeof item === "string") {
            return {
                slug: item,
                name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, " "),
                url: `/products/category/${item}`,
            };
        }
        return item;
    });
}
export async function fetchRelatedProducts(category, currentId, signal) {
    try {
        const res = await apiClient.get(`/products/category/${encodeURIComponent(category)}?limit=5`, signal);
        return res.products.filter((p) => p.id !== currentId).slice(0, 4);
    }
    catch {
        return [];
    }
}
