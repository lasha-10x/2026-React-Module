import { isArrayOf, isRecord } from './common';
import { isReview } from './product.guards';
export function isReviewsMap(value) {
    return isRecord(value) && Object.values(value).every((reviews) => isArrayOf(reviews, isReview));
}
