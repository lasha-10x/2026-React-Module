import { discountedPrice } from './format';
export function unitPrice(item) {
    return discountedPrice(item.price, item.discountPercentage);
}
export function lineTotal(item) {
    return Math.round(unitPrice(item) * item.quantity * 100) / 100;
}
export function cartSubtotal(items) {
    return Math.round(items.reduce((sum, item) => sum + lineTotal(item), 0) * 100) / 100;
}
export function cartItemCount(items) {
    return items.reduce((count, item) => count + item.quantity, 0);
}
