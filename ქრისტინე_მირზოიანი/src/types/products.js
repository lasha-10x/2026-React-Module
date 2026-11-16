// src/types/product.ts
export function isReview(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const review = value;
    return typeof review.rating === 'number'
        && typeof review.comment === 'string'
        && typeof review.date === 'string'
        && typeof review.reviewerName === 'string';
}
export function isReviewsRecord(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    return Object.values(value).every((reviews) => Array.isArray(reviews) && reviews.every(isReview));
}
export function isSortOption(value) {
    return value === ''
        || value === 'price-asc'
        || value === 'price-desc'
        || value === 'rating-desc'
        || value === 'title-asc';
}
export function isProduct(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const product = value;
    return Number.isInteger(product.id)
        && typeof product.title === 'string'
        && typeof product.description === 'string'
        && typeof product.category === 'string'
        && (product.brand === undefined || typeof product.brand === 'string')
        && typeof product.price === 'number'
        && typeof product.discountPercentage === 'number'
        && typeof product.rating === 'number'
        && Number.isInteger(product.stock)
        && typeof product.thumbnail === 'string'
        && Array.isArray(product.images)
        && product.images.every((image) => typeof image === 'string')
        && Array.isArray(product.reviews)
        && product.reviews.every(isReview);
}
export function isProductsResponse(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const response = value;
    return Array.isArray(response.products)
        && response.products.every(isProduct)
        && typeof response.total === 'number'
        && typeof response.skip === 'number'
        && typeof response.limit === 'number';
}
