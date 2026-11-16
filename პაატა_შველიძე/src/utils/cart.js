import { discountedPrice } from './format';
export function getUnitPrice(item) {
    return discountedPrice(item.price, item.discountPercentage);
}
export function getLineTotal(item) {
    return Math.round(getUnitPrice(item) * item.quantity * 100) / 100;
}
export function getSubtotal(items) {
    const sum = items.reduce((total, item) => total + getLineTotal(item), 0);
    return Math.round(sum * 100) / 100;
}
export function getItemCount(items) {
    return items.reduce((count, item) => count + item.quantity, 0);
}
