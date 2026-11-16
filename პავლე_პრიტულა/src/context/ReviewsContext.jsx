import { createContext, useContext, useState } from 'react';
import { reviewStorage } from '../utils/reviewStorage';
const ReviewsContext = createContext(undefined);
export function ReviewsProvider({ children }) {
    const [reviews, setReviews] = useState(() => {
        const result = reviewStorage.read();
        return result.ok ? result.value ?? {} : {};
    });
    function addReview(id, review) {
        const next = { ...reviews, [id]: [review, ...(reviews[id] ?? [])] };
        if (!reviewStorage.write(next))
            return false;
        setReviews(next);
        return true;
    }
    function clearReviews() {
        if (!reviewStorage.remove())
            return false;
        setReviews({});
        return true;
    }
    return <ReviewsContext.Provider value={{ reviews, addReview, clearReviews }}>{children}</ReviewsContext.Provider>;
}
export function useReviews() {
    const context = useContext(ReviewsContext);
    if (!context)
        throw new Error('ReviewsProvider is required');
    return context;
}
