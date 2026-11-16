import { isArrayOf, isRecord, isStoredReview } from "../../utils/guards";
import { StorageService } from "../../models/StorageService";
import { STORAGE_KEYS } from "../../utils/storageKeys";
function isReviewStore(value) {
    return isRecord(value) && Object.values(value).every((reviews) => isArrayOf(reviews, isStoredReview));
}
const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, isReviewStore);
function readStore() {
    return reviewsStorage.get() ?? {};
}
export function loadReviews(productId) {
    return readStore()[productId] ?? [];
}
export function saveReview(productId, review) {
    const store = readStore();
    const reviews = [review, ...(store[productId] ?? [])];
    reviewsStorage.set({ ...store, [productId]: reviews });
    return reviews;
}
export function clearReviews() {
    reviewsStorage.remove();
}
