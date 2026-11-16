function isObject(value) {
    return typeof value === "object" && value !== null;
}
export function isCartItem(value) {
    return (isObject(value) &&
        typeof value.productId === "number" &&
        typeof value.title === "string" &&
        typeof value.thumbnail === "string" &&
        typeof value.price === "number" &&
        typeof value.discountPercentage === "number" &&
        typeof value.stock === "number" &&
        typeof value.quantity === "number");
}
export function isCartState(value) {
    return (isObject(value) &&
        Array.isArray(value.items) &&
        value.items.every(isCartItem) &&
        (value.promoCode === null || typeof value.promoCode === "string"));
}
export function isOrder(value) {
    return (isObject(value) &&
        typeof value.id === "number" &&
        typeof value.number === "string" &&
        Array.isArray(value.items) &&
        value.items.every(isCartItem) &&
        typeof value.total === "number" &&
        typeof value.placedAt === "string");
}
export function isOrderList(value) {
    return Array.isArray(value) && value.every(isOrder);
}
export function isReview(value) {
    return (isObject(value) &&
        typeof value.rating === "number" &&
        typeof value.comment === "string" &&
        typeof value.date === "string" &&
        typeof value.reviewerName === "string");
}
export function isReviewsStore(value) {
    return (isObject(value) &&
        Object.values(value).every((list) => Array.isArray(list) && list.every(isReview)));
}
export function isProfile(value) {
    return (isObject(value) &&
        typeof value.firstName === "string" &&
        typeof value.lastName === "string" &&
        typeof value.email === "string" &&
        typeof value.phone === "string");
}
