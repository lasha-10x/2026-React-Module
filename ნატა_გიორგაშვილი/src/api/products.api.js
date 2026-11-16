import { ApiClient } from './ApiClient';
import { buildProductsUrl } from '../utils/url';
const client = new ApiClient('https://dummyjson.com');
export function getProducts(params, signal) {
    return client.get(buildProductsUrl(params), signal);
}
export function getProduct(id, signal) {
    return client.get(`/products/${id}`, signal);
}
export function getCategories(signal) {
    return client.get('/products/categories', signal);
}
