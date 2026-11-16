import { SORT_OPTIONS } from '../utils/catalogParams';
import { guardToParser, isProduct, isProductsResponse, parseCategories } from '../utils/guards';
import { ApiClient } from './ApiClient';
const apiClient = new ApiClient('https://dummyjson.com');
export function buildProductsPath(query) {
    const params = new URLSearchParams();
    if (query.q) {
        params.set('q', query.q);
    }
    params.set('limit', String(query.limit));
    params.set('skip', String(query.skip));
    const sortOption = SORT_OPTIONS.find((option) => option.value === query.sort);
    if (sortOption?.sortBy && sortOption.order) {
        params.set('sortBy', sortOption.sortBy);
        params.set('order', sortOption.order);
    }
    // Search and category are different endpoints, so only one of them is used.
    let path = '/products';
    if (query.q) {
        path = '/products/search';
    }
    else if (query.category) {
        path = `/products/category/${encodeURIComponent(query.category)}`;
    }
    return `${path}?${params.toString()}`;
}
export function fetchProducts(query, signal) {
    return apiClient.get(buildProductsPath(query), guardToParser(isProductsResponse), signal);
}
export function fetchProduct(id, signal) {
    return apiClient.get(`/products/${id}`, guardToParser(isProduct), signal);
}
export function fetchCategories(signal) {
    return apiClient.get('/products/categories', parseCategories, signal);
}
