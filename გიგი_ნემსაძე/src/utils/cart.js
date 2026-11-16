import { discountedPrice } from './format';
export function lineTotal(item) {
    return discountedPrice(item.price, item.discountPercentage) * item.quantity;
}
export function cartSubtotal(items) {
    return items.reduce((sum, item) => sum + lineTotal(item), 0);
}
export function cartItemCount(items) {
    return items.reduce((count, item) => count + item.quantity, 0);
}
