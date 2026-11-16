import { isArrayOf, isRecord } from './common';
export function isCartItem(value) {
    return (isRecord(value) &&
        typeof value.productId === 'number' &&
        typeof value.title === 'string' &&
        typeof value.thumbnail === 'string' &&
        typeof value.price === 'number' &&
        typeof value.discountPercentage === 'number' &&
        typeof value.stock === 'number' &&
        typeof value.quantity === 'number');
}
export function isCartState(value) {
    return (isRecord(value) &&
        isArrayOf(value.items, isCartItem) &&
        (value.promoCode === undefined || value.promoCode === null || typeof value.promoCode === 'string'));
}
