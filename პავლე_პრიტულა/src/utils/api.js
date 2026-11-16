import { isReview } from './reviewStorage.js';
import { isDiscount, isNonnegativeInteger, isNonnegativeNumber, isRecord } from './decode.js';
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}
export function isApiError(error) {
    return error instanceof ApiError;
}
class ApiClient {
    async get(path, decode, signal) {
        const response = await fetch(`https://dummyjson.com${path}`, { signal });
        if (!response.ok)
            throw new ApiError('Product API request failed', response.status);
        const value = await response.json();
        return decode(value);
    }
}
const api = new ApiClient();
function decodeProduct(value) {
    if (!isRecord(value) || !isNonnegativeInteger(value.id) || value.id === 0 ||
        typeof value.title !== 'string' || !value.title.trim() ||
        typeof value.description !== 'string' ||
        !isNonnegativeNumber(value.price) || !isNonnegativeInteger(value.stock) ||
        typeof value.thumbnail !== 'string' || !value.thumbnail.trim() ||
        !Array.isArray(value.images) || !value.images.every((image) => typeof image === 'string') ||
        typeof value.category !== 'string' || !value.category.trim() ||
        !isNonnegativeNumber(value.rating) || value.rating > 5 || !isDiscount(value.discountPercentage))
        throw new ApiError('Invalid product data', 502);
    return {
        id: value.id,
        title: value.title,
        description: value.description,
        price: value.price,
        stock: value.stock,
        thumbnail: value.thumbnail,
        images: value.images,
        category: value.category,
        brand: typeof value.brand === 'string' && value.brand.trim() ? value.brand.trim() : undefined,
        rating: value.rating,
        discountPercentage: value.discountPercentage,
        reviews: Array.isArray(value.reviews) ? value.reviews.filter(isReview) : [],
    };
}
function decodeProducts(value) {
    if (!isRecord(value) || !Array.isArray(value.products) || !isNonnegativeInteger(value.total) ||
        !isNonnegativeInteger(value.skip) || !isNonnegativeInteger(value.limit)) {
        throw new ApiError('Invalid catalog data', 502);
    }
    return { products: value.products.map(decodeProduct), total: value.total, skip: value.skip, limit: value.limit };
}
export function getProducts(path, signal) {
    return api.get(path, decodeProducts, signal);
}
export function getProduct(id, signal) {
    return api.get(`/products/${id}`, (value) => {
        const product = decodeProduct(value);
        if (product.id !== id)
            throw new ApiError('Unexpected product ID', 502);
        return product;
    }, signal);
}
export function getCategories(signal) {
    return api.get('/products/categories', (value) => {
        if (!Array.isArray(value))
            throw new ApiError('Invalid category data', 502);
        return value.map((category) => {
            if (!isRecord(category) || typeof category.slug !== 'string' || typeof category.name !== 'string' ||
                !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.slug) || !category.name.trim()) {
                throw new ApiError('Invalid category data', 502);
            }
            return { slug: category.slug, name: category.name };
        });
    }, signal);
}
