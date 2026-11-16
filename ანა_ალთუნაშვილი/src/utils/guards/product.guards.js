import { isArrayOf, isOptionalString, isRecord } from './common';
export function isReview(value) {
    return (isRecord(value) &&
        typeof value.rating === 'number' &&
        typeof value.comment === 'string' &&
        typeof value.date === 'string' &&
        typeof value.reviewerName === 'string');
}
export function isProduct(value) {
    return (isRecord(value) &&
        typeof value.id === 'number' &&
        typeof value.title === 'string' &&
        typeof value.description === 'string' &&
        typeof value.category === 'string' &&
        isOptionalString(value.brand) &&
        typeof value.price === 'number' &&
        typeof value.discountPercentage === 'number' &&
        typeof value.rating === 'number' &&
        typeof value.stock === 'number' &&
        typeof value.thumbnail === 'string' &&
        isArrayOf(value.images, (image) => typeof image === 'string') &&
        isArrayOf(value.reviews, isReview));
}
export function isProductsResponse(value) {
    return (isRecord(value) &&
        isArrayOf(value.products, isProduct) &&
        typeof value.total === 'number' &&
        typeof value.skip === 'number' &&
        typeof value.limit === 'number');
}
export function isCategory(value) {
    return (isRecord(value) &&
        typeof value.slug === 'string' &&
        typeof value.name === 'string' &&
        typeof value.url === 'string');
}
export function isCategoryList(value) {
    return isArrayOf(value, isCategory);
}
