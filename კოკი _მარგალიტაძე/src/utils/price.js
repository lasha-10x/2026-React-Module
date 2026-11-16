export const PROMO_CODE = '10X10';
export const PROMO_PERCENT = 10;
export const FREE_SHIPPING_FROM = 100;
export const SHIPPING_COST = 10;
export function discountedPrice(price, discountPercentage) {
    return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}
export function formatPrice(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
export function unitPrice(item) {
    return discountedPrice(item.price, item.discountPercentage);
}
export function lineTotal(item) {
    return Math.round(unitPrice(item) * item.quantity * 100) / 100;
}
export function cartTotal(items) {
    return (Math.round(items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0) * 100) / 100);
}
export function isValidPromo(code) {
    return code.trim().toUpperCase() === PROMO_CODE;
}
export function cartTotals(items, promoCode) {
    const subtotal = cartTotal(items);
    const discount = promoCode ? Math.round(subtotal * PROMO_PERCENT) / 100 : 0;
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;
    return { subtotal, discount, shipping, total };
}
