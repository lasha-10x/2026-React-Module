import { isRecord } from './decode.js';
import { STORAGE_KEYS, StorageService } from './storage.js';
export function isReview(value) {
    return isRecord(value) && typeof value.reviewerName === 'string' && value.reviewerName.trim() !== '' &&
        typeof value.rating === 'number' && Number.isInteger(value.rating) && value.rating >= 1 && value.rating <= 5 &&
        typeof value.date === 'string' && Number.isFinite(Date.parse(value.date)) &&
        typeof value.comment === 'string' && value.comment.trim() !== '';
}
export const reviewStorage = new StorageService(STORAGE_KEYS.reviews, (input) => {
    if (!isRecord(input))
        return;
    const reviews = {};
    for (const [id, entries] of Object.entries(input)) {
        if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) ||
            !Array.isArray(entries) || !entries.every(isReview))
            return;
        reviews[id] = entries;
    }
    return reviews;
});
