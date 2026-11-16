export function discountedPrice(price, discountPercentage) {
    return price * (1 - discountPercentage / 100);
}
export function formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
}
export function formatDate(isoDate) {
    try {
        return new Date(isoDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    catch {
        return isoDate;
    }
}
