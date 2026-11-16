export function formatPrice(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
export function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function discountedPrice(price, pct) {
    return round2(price * (1 - pct / 100));
}
export function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return "";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
export function formatDateTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return "";
    return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
export function pluralize(count, one, many = `${one}s`) {
    return `${count} ${count === 1 ? one : many}`;
}
