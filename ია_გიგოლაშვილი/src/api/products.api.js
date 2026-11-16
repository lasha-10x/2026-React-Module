import { SHOP_CATEGORIES, isShopCategory } from "../utils/catalog";
import { api } from "./ApiClient";
export async function fetchCategories(signal) {
    const categories = await api.get("/products/categories", signal);
    return categories.filter((category) => isShopCategory(category.slug));
}
export async function fetchShopProducts({ q, category }, signal) {
    if (q) {
        const result = await api.get(`/products/search?q=${encodeURIComponent(q)}&limit=0`, signal);
        return result.products.filter((product) => isShopCategory(product.category) && (!category || product.category === category));
    }
    const slugs = category ? [category] : SHOP_CATEGORIES;
    const responses = await Promise.all(slugs.map((slug) => api.get(`/products/category/${slug}?limit=0`, signal)));
    return responses.flatMap((response) => response.products);
}
export function fetchProduct(id, signal) {
    return api.get(`/products/${id}`, signal);
}
/** Up to 4 other products from the same category. */
export async function fetchRelatedProducts(category, excludeId, signal) {
    const result = await api.get(`/products/category/${category}?limit=5`, signal);
    return result.products.filter((product) => product.id !== excludeId).slice(0, 4);
}
