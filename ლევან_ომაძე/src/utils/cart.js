import { discountedPrice, round2 } from './format';
function isCartItem(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const item = value;
    return (typeof item.productId === 'number' &&
        typeof item.title === 'string' &&
        typeof item.thumbnail === 'string' &&
        typeof item.price === 'number' &&
        typeof item.discountPercentage === 'number' &&
        typeof item.stock === 'number' &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0);
}
export function isCartState(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value;
    return Array.isArray(candidate.items) && candidate.items.every(isCartItem);
}
export function calculateTotals(items) {
    let subtotal = 0;
    let itemCount = 0;
    for (const item of items) {
        subtotal += discountedPrice(item.price, item.discountPercentage) * item.quantity;
        itemCount += item.quantity;
    }
    const total = round2(subtotal);
    return { subtotal: total, total, itemCount };
}
