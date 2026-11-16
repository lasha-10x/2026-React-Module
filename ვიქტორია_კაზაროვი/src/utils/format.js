const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
export function discountedPrice(price, percentage) {
    return Math.round((price * (1 - percentage / 100) + Number.EPSILON) * 100) / 100;
}
export function formatPrice(amount) {
    return usdFormatter.format(amount);
}
