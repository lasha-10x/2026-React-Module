import { useCallback, useMemo } from "react";
import { StorageService } from "@/models/StorageService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isReviewsMap } from "@/utils/guards";
import { STORAGE_KEYS } from "@/utils/constants";
// Exported so the Profile page can wipe the key ("Clear local data").
export const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, isReviewsMap);
// Reviews written by the user live in localStorage: shop_reviews = { [productId]: Review[] }.
export function useReviews(productId) {
    const [all, setAll] = useLocalStorage(STORAGE_KEYS.reviews, {}, isReviewsMap);
    const localReviews = useMemo(() => all[String(productId)] ?? [], [all, productId]);
    const addReview = useCallback((review) => {
        setAll((prev) => ({ ...prev, [String(productId)]: [review, ...(prev[String(productId)] ?? [])] }));
    }, [productId, setAll]);
    // A review's `date` (ISO timestamp with milliseconds) is its identity: only the user's own reviews live here.
    const updateReview = useCallback((date, changes) => {
        setAll((prev) => ({
            ...prev,
            [String(productId)]: (prev[String(productId)] ?? []).map((r) => (r.date === date ? { ...r, ...changes } : r)),
        }));
    }, [productId, setAll]);
    const removeReview = useCallback((date) => {
        setAll((prev) => ({ ...prev, [String(productId)]: (prev[String(productId)] ?? []).filter((r) => r.date !== date) }));
    }, [productId, setAll]);
    return { localReviews, addReview, updateReview, removeReview };
}
