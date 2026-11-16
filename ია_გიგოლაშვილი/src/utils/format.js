const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
/** Rounds to cents — avoids 0.1 + 0.2 style floating point noise in totals. */
export function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}
/** price × (1 − discount / 100), rounded to 2 decimals. */
export function discountedPrice(price, discountPercentage) {
    return roundMoney(price * (1 - discountPercentage / 100));
}
/** 1299 → "$1,299.00" */
export function formatPrice(amount, currency = "USD") {
    if (currency === "USD")
        return usd.format(amount);
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
/** "skin-care" → "Skin Care" */
export function formatCategory(slug) {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
export function pluralize(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}
