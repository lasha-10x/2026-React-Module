const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatPrice(amount) {
    return priceFormatter.format(amount);
}
export function discountedPrice(price, discountPercentage) {
    return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}
