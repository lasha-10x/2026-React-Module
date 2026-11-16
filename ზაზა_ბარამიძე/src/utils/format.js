const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
export function formatPrice(amount) {
    return priceFormatter.format(amount);
}
export function discountedPrice(price, discountPercentage) {
    const result = price * (1 - discountPercentage / 100);
    return Math.round(result * 100) / 100;
}
