export function discountedPrice(price, discountPercentage) {
    const discounted = price * (1 - discountPercentage / 100);
    return Math.round((discounted + Number.EPSILON) * 100) / 100;
}
export function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}
