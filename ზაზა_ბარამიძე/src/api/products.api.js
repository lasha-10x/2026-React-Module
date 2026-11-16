import { ApiError } from './ApiError';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
async function request(path) {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) {
        throw new ApiError(response.status, `Request failed with status ${response.status}`);
    }
    return (await response.json());
}
export function fetchProducts(limit = 100, skip = 0) {
    return request(`/products?limit=${limit}&skip=${skip}`);
}
export function fetchProductById(id) {
    return request(`/products/${id}`);
}
