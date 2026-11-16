export function discountedPrice(price, discountPercentage) {
    return Number((price * (1 - discountPercentage / 100)).toFixed(2));
}
export function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}
