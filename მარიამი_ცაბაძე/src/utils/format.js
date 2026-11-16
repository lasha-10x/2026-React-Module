export function formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}
export function discountedPrice(price, percentage) {
    return (Math.round((price * (1 - percentage / 100) + Number.EPSILON) * 100) / 100);
}
export function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString();
}
