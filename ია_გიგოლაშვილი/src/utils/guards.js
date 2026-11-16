/*
 * Type guards for data that comes from outside TypeScript's control (localStorage, location.state).
 * JSON.parse returns `unknown` for us — these functions prove the shape before we use it.
 */
export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function isString(value) {
    return typeof value === "string";
}
export function isCartItem(value) {
    return (isRecord(value) &&
        isNumber(value.productId) &&
        isString(value.title) &&
        isString(value.thumbnail) &&
        isNumber(value.price) &&
        isNumber(value.discountPercentage) &&
        isNumber(value.stock) &&
        isNumber(value.quantity));
}
export function isCartState(value) {
    return (isRecord(value) &&
        Array.isArray(value.items) &&
        value.items.every(isCartItem) &&
        (value.promoCode === null || isString(value.promoCode)));
}
function isShippingInfo(value) {
    return (isRecord(value) &&
        isString(value.fullName) &&
        isString(value.email) &&
        isString(value.address) &&
        isString(value.city));
}
export function isOrder(value) {
    return (isRecord(value) &&
        isNumber(value.id) &&
        isString(value.number) &&
        Array.isArray(value.items) &&
        value.items.every(isCartItem) &&
        isShippingInfo(value.shipping) &&
        (value.promoCode === null || isString(value.promoCode)) &&
        isNumber(value.subtotal) &&
        isNumber(value.discount) &&
        isNumber(value.shippingCost) &&
        isNumber(value.total) &&
        isString(value.placedAt));
}
export function isOrderList(value) {
    return Array.isArray(value) && value.every(isOrder);
}
export function isReview(value) {
    return (isRecord(value) &&
        isNumber(value.rating) &&
        isString(value.comment) &&
        isString(value.date) &&
        isString(value.reviewerName));
}
export function isReviewMap(value) {
    return isRecord(value) && Object.values(value).every((list) => Array.isArray(list) && list.every(isReview));
}
export function isTheme(value) {
    return value === "light" || value === "dark";
}
export function isAuthUser(value) {
    return (isRecord(value) &&
        isString(value.username) &&
        isString(value.firstName) &&
        isString(value.lastName) &&
        isString(value.email) &&
        isString(value.phone));
}
/** Reads `{ from: "/checkout" }` that ProtectedRoute puts into location.state. */
export function getRedirectPath(state, fallback = "/") {
    if (isRecord(state) && isString(state.from) && state.from.startsWith("/"))
        return state.from;
    return fallback;
}
/** Reads an optional `{ message: "…" }` passed between pages via location.state. */
export function getStateMessage(state) {
    if (isRecord(state) && isString(state.message))
        return state.message;
    return null;
}
