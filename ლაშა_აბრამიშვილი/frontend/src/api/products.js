import { usdToCents } from '../money.js';
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isNonemptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isNonnegativeInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function isImageUrl(value) {
    return isNonemptyString(value) && URL.canParse(value) && /^https?:\/\//.test(value);
}
function isProduct(value) {
    if (!isRecord(value))
        return false;
    return isNonnegativeInteger(value.id) && value.id > 0
        && isNonemptyString(value.title)
        && isNonemptyString(value.category)
        && usdToCents(value.price) !== null
        && (value.rating === undefined || (typeof value.rating === 'number'
            && Number.isFinite(value.rating) && value.rating >= 0 && value.rating <= 5))
        && isImageUrl(value.thumbnail);
}
export function parseProductsResponse(value) {
    if (!isRecord(value)
        || !Array.isArray(value.products) || !value.products.every(isProduct)
        || !isNonnegativeInteger(value.total)
        || !isNonnegativeInteger(value.skip)
        || !isNonnegativeInteger(value.limit)
        || value.products.length > value.limit
        || (value.products.length > 0 && value.skip + value.products.length > value.total)
        || new Set(value.products.map((product) => product.id)).size !== value.products.length) {
        throw new Error('The catalog service returned an unexpected response. Please try again.');
    }
    return { products: value.products, total: value.total, skip: value.skip, limit: value.limit };
}
export async function readProductResponse(response, signal) {
    if (!response.ok) {
        throw new Error(`The catalog service is unavailable (HTTP ${response.status}). Please try again.`);
    }
    let data;
    try {
        data = await response.json();
    }
    catch (error) {
        if (signal.aborted)
            throw error;
        throw new Error('The catalog service returned an unreadable response. Please try again.', { cause: error });
    }
    return data;
}
export async function getProducts(signal) {
    const response = await fetch('https://dummyjson.com/products?limit=12&skip=0', { signal });
    return parseProductsResponse(await readProductResponse(response, signal));
}
export function parseProductId(value) {
    if (!value || !/^[1-9]\d*$/.test(value))
        return null;
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}
function isProductDetails(value) {
    return isProduct(value)
        && isNonemptyString(value.description)
        && Array.isArray(value.images) && value.images.every(isImageUrl)
        && isNonnegativeInteger(value.stock)
        && ['brand', 'availabilityStatus', 'sku', 'shippingInformation', 'warrantyInformation', 'returnPolicy']
            .every((key) => value[key] === undefined || isNonemptyString(value[key]))
        && (value.minimumOrderQuantity === undefined
            || (isNonnegativeInteger(value.minimumOrderQuantity) && value.minimumOrderQuantity > 0));
}
export function parseProductDetails(value) {
    if (!isProductDetails(value)) {
        throw new Error('The catalog service returned unexpected product details. Please try again.');
    }
    return value;
}
export async function getProductDetails(value, signal) {
    const id = parseProductId(value);
    if (id === null)
        return null;
    const response = await fetch(`https://dummyjson.com/products/${id}`, { signal });
    if (response.status === 404)
        return null;
    const product = parseProductDetails(await readProductResponse(response, signal));
    if (product.id !== id)
        throw new Error('The catalog service returned the wrong product. Please try again.');
    return product;
}
