import { api } from "../../api/ApiClient";
import { buildProductsUrl, PAGE_SIZE } from "../../utils/url";
async function getProducts(query, signal) {
    const data = await api.get(buildProductsUrl(query), signal);
    const search = query.search.trim().toLowerCase();
    if (!search)
        return data;
    const matches = data.products.filter((product) => product.title.toLowerCase().includes(search));
    const skip = (query.page - 1) * PAGE_SIZE;
    return {
        ...data,
        products: matches.slice(skip, skip + PAGE_SIZE),
        total: matches.length,
        skip,
        limit: PAGE_SIZE,
    };
}
export function getProductById(id, signal) {
    return api.get(`/products/${id}`, signal);
}
export function getCategories() {
    return api.get("/products/categories");
}
export default getProducts;
