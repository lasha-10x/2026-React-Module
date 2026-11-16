export const CATEGORIES_PATH = "/products/categories";
export function productPath(id) {
    return `/products/${id}`;
}
// Every product with only id and title (small): used to turn a name in the URL into an id.
export const PRODUCT_INDEX_PATH = "/products?limit=0&select=id,title";
// Related products: same category, one extra item so we can drop the current product.
export function relatedPath(category) {
    return `/products/category/${encodeURIComponent(category)}?limit=5`;
}
