const API_URL = 'https://dummyjson.com/products';
export async function getProducts() {
    const response = await fetch(`${API_URL}?limit=12&skip=0`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products;
}
export async function getCategories() {
    const response = await fetch(`${API_URL}/category-list`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    const categories = await response.json();
    return categories;
}
export async function getProductById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) {
        throw new Error('Product not found');
    }
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    const product = await response.json();
    return product;
}
