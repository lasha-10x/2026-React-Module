import { discountedPrice } from './format';
/** Build a cart line from a product. */
export function toCartItem(product, quantity) {
    return {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity,
    };
}
/** Unit price the customer actually pays. */
export function getUnitPrice(item) {
    return discountedPrice(item.price, item.discountPercentage);
}
export function getLineTotal(item) {
    return Math.round(getUnitPrice(item) * item.quantity * 100) / 100;
}
/** Σ quantity — the number on the Header badge. */
export function getItemCount(items) {
    return items.reduce((count, item) => count + item.quantity, 0);
}
/** P4.3 — total = Σ (discounted unit price × quantity). */
export function getCartTotal(items) {
    const total = items.reduce((sum, item) => sum + getLineTotal(item), 0);
    return Math.round(total * 100) / 100;
}
