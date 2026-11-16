const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
/** 1299 -> "$1,299.00" */
export function formatPrice(amount) {
    return usdFormatter.format(amount);
}
/** price × (1 − discountPercentage / 100), rounded to 2 decimals (P2.3). */
export function discountedPrice(price, discountPercentage) {
    return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}
/** The green "−9%" badge is only shown for discounts of at least 1%. */
export function hasVisibleDiscount(discountPercentage) {
    return discountPercentage >= 1;
}
