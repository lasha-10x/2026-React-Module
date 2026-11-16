export function formatPrice(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
}
export function discountedPrice(price, discountPercentage) {
    if (!discountPercentage || discountPercentage <= 0) {
        return price;
    }
    const result = price * (1 - discountPercentage / 100);
    return Math.round(result * 100) / 100;
}
export function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
