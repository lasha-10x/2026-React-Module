import { reviewsStore } from "./storage";
export function loadReviews(productId) {
    return reviewsStore.get()?.[productId] ?? [];
}
export function saveReview(productId, review) {
    const store = reviewsStore.get() ?? {};
    const current = store[productId] ?? [];
    reviewsStore.set({ ...store, [productId]: [review, ...current] });
}
