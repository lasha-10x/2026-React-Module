/** Discounted price = price × (1 − discountPercentage / 100), rounded to 2 decimals. */
export function discountedPrice(price, discountPercentage) {
    const safeDiscount = Math.min(Math.max(discountPercentage, 0), 100);
    return Math.round(price * (1 - safeDiscount / 100) * 100) / 100;
}
/** Final price of a product after its own discount. */
export function getFinalPrice(product) {
    return discountedPrice(product.price, product.discountPercentage ?? 0);
}
/** A discount badge is shown only for discounts of at least 1%. */
export function hasDiscount(product) {
    return (product.discountPercentage ?? 0) >= 1;
}
const currencyFormatters = new Map();
/** Formats an amount such as 1299 as "$1,299.00". */
export function formatPrice(amount, currency = "USD") {
    let formatter = currencyFormatters.get(currency);
    if (!formatter) {
        formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
        currencyFormatters.set(currency, formatter);
    }
    return formatter.format(amount);
}
/** Formats an ISO date as "Nov 5, 2026". */
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
