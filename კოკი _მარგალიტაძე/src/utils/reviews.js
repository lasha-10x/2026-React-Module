const STORAGE_KEY = 'shop_reviews';
export function isReview(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'rating' in value &&
        typeof value.rating === 'number' &&
        'comment' in value &&
        typeof value.comment === 'string' &&
        'date' in value &&
        typeof value.date === 'string' &&
        'reviewerName' in value &&
        typeof value.reviewerName === 'string');
}
export function getApiReviews(product) {
    const withReviews = product;
    return Array.isArray(withReviews.reviews)
        ? withReviews.reviews.filter(isReview)
        : [];
}
function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return {};
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null)
            return {};
        const result = {};
        for (const [key, value] of Object.entries(parsed)) {
            if (Array.isArray(value))
                result[key] = value.filter(isReview);
        }
        return result;
    }
    catch {
        return {};
    }
}
export function getLocalReviews(productId) {
    return readAll()[String(productId)] ?? [];
}
export function addLocalReview(productId, review) {
    const all = readAll();
    all[String(productId)] = [review, ...(all[String(productId)] ?? [])];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    catch {
        // storage can be full or blocked; the review still shows for this visit
    }
}
