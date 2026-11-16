import { discountedPrice } from './format';
export function getLineTotal(item) {
    return discountedPrice(item.price, item.discountPercentage) * item.quantity;
}
export function getCartCount(items) {
    return items.reduce((count, item) => count + item.quantity, 0);
}
export function getCartSubtotal(items) {
    const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
    return Math.round(subtotal * 100) / 100;
}
export function createCartItem(product) {
    return {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity: 1,
    };
}
export function getQuantityInCart(items, productId) {
    return items.find((item) => item.productId === productId)?.quantity ?? 0;
}
