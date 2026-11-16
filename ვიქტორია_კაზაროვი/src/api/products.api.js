export async function fetchProducts(skip = 0, signal) {
    const response = await fetch(`https://dummyjson.com/products?limit=12&skip=${skip}`, { signal });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return (await response.json());
}
export async function searchProducts(query, skip, signal) {
    const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=12&skip=${skip}`, { signal });
    if (!response.ok) {
        throw new Error('Failed to search products');
    }
    return (await response.json());
}
export async function fetchProductById(id) {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return (await response.json());
}
