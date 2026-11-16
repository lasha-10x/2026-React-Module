import { buildProductsUrl } from "../utils/url";
const BASE_URL = "https://dummyjson.com";
// signal: AbortController-ისგან. abort() ამ მოთხოვნას გააუქმებს
export async function getProducts(params, signal) {
    const res = await fetch(BASE_URL + buildProductsUrl(params), { signal });
    if (!res.ok) {
        throw new Error(`Failed to load products (HTTP ${res.status})`);
    }
    return (await res.json());
}
// 404-ზე null-ს ვაბრუნებთ: "პროდუქტი არ არსებობს" ნორმალური პასუხია და არა ქსელის შეცდომა
export async function getProductById(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (res.status === 404)
        return null;
    if (!res.ok) {
        throw new Error(`Failed to load product (HTTP ${res.status})`);
    }
    return (await res.json());
}
export async function getCategories() {
    const res = await fetch(`${BASE_URL}/products/categories`);
    if (!res.ok) {
        throw new Error(`Failed to load categories (HTTP ${res.status})`);
    }
    return (await res.json());
}
