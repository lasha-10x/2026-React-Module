import { StorageService, STORAGE_KEYS } from './storage';
function isReview(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    return ('rating' in value &&
        typeof value.rating === 'number' &&
        'comment' in value &&
        typeof value.comment === 'string' &&
        'date' in value &&
        typeof value.date === 'string' &&
        'reviewerName' in value &&
        typeof value.reviewerName === 'string');
}
export function getLocalReviews(productId) {
    const saved = StorageService.get(STORAGE_KEYS.reviews, {});
    if (typeof saved !== 'object' ||
        saved === null ||
        !(String(productId) in saved))
        return [];
    const reviews = saved[String(productId)];
    return Array.isArray(reviews) ? reviews.filter(isReview) : [];
}
export function saveLocalReview(productId, review) {
    const saved = StorageService.get(STORAGE_KEYS.reviews, {});
    const reviews = typeof saved === 'object' && saved !== null
        ? saved
        : {};
    const existing = getLocalReviews(productId);
    StorageService.set(STORAGE_KEYS.reviews, {
        ...reviews,
        [productId]: [review, ...existing]
    });
}
