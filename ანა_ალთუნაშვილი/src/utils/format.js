/** Round to 2 decimals so money values never show 0.30000000000000004. */
export function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
/** price x (1 - discountPercentage / 100), rounded to 2 decimals. */
export function discountedPrice(price, discountPercentage) {
    return round2(price * (1 - discountPercentage / 100));
}
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
/** "mens-shirts" -> "Mens shirts" */
export function formatCategory(slug) {
    const text = slug.replaceAll('-', ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}
