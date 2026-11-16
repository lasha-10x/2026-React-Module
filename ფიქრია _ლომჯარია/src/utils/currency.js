const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export function formatPrice(price) {
    return usd.format(price);
}
export function priceInCents(price) {
    return Math.round(price * 100);
}
export function discountedPrice(price, discountPercentage = 0) {
    const discount = Number.isFinite(discountPercentage) && discountPercentage > 0 &&
        discountPercentage <= 100 ? discountPercentage : 0;
    return priceInCents(price * (1 - discount / 100)) / 100;
}
export function lineSubtotal(price, quantity, discountPercentage) {
    return priceInCents(discountedPrice(price, discountPercentage)) * quantity / 100;
}
