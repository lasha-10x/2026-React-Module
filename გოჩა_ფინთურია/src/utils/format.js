export function formatPrice(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}
export function discountedPrice(price, discountPercentage) {
    if (!discountPercentage || discountPercentage <= 0) {
        return price;
    }
    const discounted = price * (1 - discountPercentage / 100);
    return Math.round(discounted * 100) / 100;
}
export function formatDate(iso) {
    try {
        const date = new Date(iso);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    catch {
        return iso;
    }
}
export function isProduct(x) {
    if (typeof x !== "object" || x === null)
        return false;
    const cand = x;
    return (typeof cand.id === "number" &&
        typeof cand.title === "string" &&
        typeof cand.price === "number" &&
        typeof cand.thumbnail === "string");
}
