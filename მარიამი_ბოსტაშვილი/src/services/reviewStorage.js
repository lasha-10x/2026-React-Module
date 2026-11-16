import { StorageService } from "./StorageService";
import { STORAGE_KEYS } from "./storageKeys";
function isReview(value) {
    return (typeof value === "object" && value !== null &&
        "rating" in value && typeof value.rating === "number" &&
        "comment" in value && typeof value.comment === "string" &&
        "date" in value && typeof value.date === "string" &&
        "reviewerName" in value && typeof value.reviewerName === "string");
}
function isLocalReviews(value) {
    return (typeof value === "object" && value !== null && !Array.isArray(value) &&
        Object.values(value).every((list) => Array.isArray(list) && list.every(isReview)));
}
export const reviewStorage = new StorageService(STORAGE_KEYS.reviews, isLocalReviews, {});
/** Deletes only the reviews this shopper wrote; other shoppers' reviews stay. */
export function removeReviewsBy(username) {
    const remaining = {};
    for (const [productId, list] of Object.entries(reviewStorage.load())) {
        const kept = list.filter((review) => review.reviewerName !== username);
        if (kept.length > 0)
            remaining[productId] = kept;
    }
    reviewStorage.save(remaining);
}
export function averageRating(reviews, fallback) {
    if (reviews.length === 0)
        return fallback;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}
