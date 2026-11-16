export function discountedPrice(price, discountPercentage) {
    return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}
export function formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
