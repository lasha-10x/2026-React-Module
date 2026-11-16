import { isProductReview } from '../types/review';
export const productPageSize = 12;
function addSortParams(params, sort) {
    switch (sort) {
        case 'default':
            return;
        case 'price-asc':
            params.set('sortBy', 'price');
            params.set('order', 'asc');
            return;
        case 'price-desc':
            params.set('sortBy', 'price');
            params.set('order', 'desc');
            return;
        case 'rating-desc':
            params.set('sortBy', 'rating');
            params.set('order', 'desc');
            return;
        case 'title-asc':
            params.set('sortBy', 'title');
            params.set('order', 'asc');
    }
}
const productsUrl = 'https://dummyjson.com/products';
export class ProductNotFoundError extends Error {
    constructor(id) {
        super(`Product ${id} was not found.`);
        this.name = 'ProductNotFoundError';
    }
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isProductCategory(value) {
    return (isRecord(value) &&
        typeof value.slug === 'string' &&
        typeof value.name === 'string' &&
        typeof value.url === 'string');
}
function isProduct(value) {
    return (isRecord(value) &&
        typeof value.id === 'number' &&
        Number.isSafeInteger(value.id) &&
        value.id > 0 &&
        typeof value.title === 'string' &&
        typeof value.description === 'string' &&
        typeof value.price === 'number' &&
        Number.isFinite(value.price) &&
        (value.discountPercentage === undefined || typeof value.discountPercentage === 'number') &&
        (value.brand === undefined || typeof value.brand === 'string') &&
        (value.rating === undefined || typeof value.rating === 'number') &&
        typeof value.stock === 'number' &&
        typeof value.category === 'string' &&
        typeof value.thumbnail === 'string' &&
        (value.reviews === undefined || (Array.isArray(value.reviews) && value.reviews.every(isProductReview))) &&
        (value.images === undefined || (Array.isArray(value.images) &&
            value.images.every((image) => typeof image === 'string'))));
}
function isProductsResponse(value) {
    return (isRecord(value) &&
        Array.isArray(value.products) &&
        value.products.every(isProduct) &&
        typeof value.total === 'number' &&
        typeof value.skip === 'number' &&
        typeof value.limit === 'number');
}
async function fetchProductList(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Product request failed (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!isProductsResponse(data)) {
        throw new Error('The product API returned an unexpected response.');
    }
    return data;
}
export function fetchProducts(signal) {
    return fetchProductList(productsUrl, signal);
}
function paginationParams(page, limit) {
    if (!Number.isSafeInteger(page) || page < 1) {
        throw new Error('Page must be a positive safe integer.');
    }
    if (!Number.isSafeInteger(limit) || limit < 1) {
        throw new Error('Page size must be a positive safe integer.');
    }
    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip)) {
        throw new Error('The requested page offset is too large.');
    }
    return new URLSearchParams({ limit: String(limit), skip: String(skip) });
}
export async function fetchProductsPage(page, limit = productPageSize, signal, sort = 'default') {
    const params = paginationParams(page, limit);
    addSortParams(params, sort);
    return fetchProductList(`${productsUrl}?${params}`, signal);
}
export async function searchProducts(query, signal, pagination, sort = 'default') {
    const params = pagination ? paginationParams(pagination.page, pagination.limit ?? productPageSize) : new URLSearchParams();
    params.set('q', query);
    addSortParams(params, sort);
    return fetchProductList(`${productsUrl}/search?${params}`, signal);
}
export async function getProductsByCategory(categorySlug, signal, pagination, sort = 'default') {
    const params = pagination ? paginationParams(pagination.page, pagination.limit ?? productPageSize) : new URLSearchParams();
    addSortParams(params, sort);
    const suffix = params.size > 0 ? `?${params}` : '';
    return fetchProductList(`${productsUrl}/category/${encodeURIComponent(categorySlug)}${suffix}`, signal);
}
export async function getProductCategories(signal) {
    const response = await fetch(`${productsUrl}/categories`, { signal });
    if (!response.ok) {
        throw new Error(`Category request failed (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || !data.every(isProductCategory)) {
        throw new Error('The category API returned an unexpected response.');
    }
    return data;
}
export async function fetchProductById(id, signal) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error('A product ID must be a positive safe integer.');
    }
    const response = await fetch(`${productsUrl}/${id}`, { signal });
    if (response.status === 404) {
        throw new ProductNotFoundError(id);
    }
    if (!response.ok) {
        throw new Error(`Product request failed (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!isProduct(data) || data.id !== id) {
        throw new Error('The product API returned an unexpected response.');
    }
    return data;
}
