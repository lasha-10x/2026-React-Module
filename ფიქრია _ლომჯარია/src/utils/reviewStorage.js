import { isProductReview } from '../types/review';
const storageKey = 'shop_reviews';
function readStoredReviews() {
    const saved = localStorage.getItem(storageKey);
    if (!saved)
        return {};
    let data;
    try {
        data = JSON.parse(saved);
    }
    catch {
        return {};
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data))
        return {};
    const result = {};
    for (const [id, reviews] of Object.entries(data)) {
        if (!/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(Number(id)) || !Array.isArray(reviews))
            continue;
        result[id] = reviews.filter(isProductReview).map(({ rating, comment, date, reviewerName }) => ({
            rating, comment, date, reviewerName,
        }));
    }
    return result;
}
export function loadProductReviews(productId) {
    try {
        return (readStoredReviews()[String(productId)] ?? [])
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    }
    catch {
        return [];
    }
}
export function saveProductReview(productId, review) {
    if (!Number.isSafeInteger(productId) || productId < 1 || !isProductReview(review)) {
        throw new Error('Invalid local review.');
    }
    // Read again at submission so reviews for other products are preserved.
    const stored = readStoredReviews();
    const reviews = [review, ...(stored[String(productId)] ?? [])];
    stored[String(productId)] = reviews;
    localStorage.setItem(storageKey, JSON.stringify(stored));
    return reviews;
}
