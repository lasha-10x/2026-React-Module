const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
export function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function discountedPrice(price, discountPercentage) {
    return round2(price * (1 - discountPercentage / 100));
}
export function formatPrice(value) {
    return currencyFormatter.format(value);
}
