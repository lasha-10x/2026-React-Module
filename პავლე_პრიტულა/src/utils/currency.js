const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
export function toCents(amount) {
    const cents = amount * 100;
    return Math.round(cents + Number.EPSILON * cents);
}
export function formatCents(cents) {
    return usdFormatter.format(cents / 100);
}
export function discountedPrice(price, discountPercentage) {
    return price * (100 - discountPercentage) / 100;
}
export function discountedUnitCents({ price, discountPercentage }) {
    return toCents(discountedPrice(price, discountPercentage));
}
export function lineTotalCents(item) {
    return discountedUnitCents(item) * item.quantity;
}
export function hasResolvedPrice(item) {
    return item.discountPercentage !== undefined;
}
export function calculateSubtotalCents(items) {
    return items.reduce((total, item) => total + lineTotalCents(item), 0);
}
