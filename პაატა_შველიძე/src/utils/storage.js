import { Cart } from '../models/Cart';
import { StorageService } from '../models/StorageService';
import { isRecord, isReview } from './guards';
export const STORAGE_KEYS = {
    cart: 'shop_cart',
    orders: 'shop_orders',
    reviews: 'shop_reviews',
    theme: 'shop_theme',
};
function isCartItem(value) {
    return (isRecord(value) &&
        typeof value.productId === 'number' &&
        typeof value.title === 'string' &&
        typeof value.thumbnail === 'string' &&
        typeof value.price === 'number' &&
        typeof value.discountPercentage === 'number' &&
        typeof value.stock === 'number' &&
        typeof value.quantity === 'number' &&
        Number.isInteger(value.quantity) &&
        value.quantity >= 1);
}
function isShippingInfo(value) {
    return (isRecord(value) &&
        typeof value.fullName === 'string' &&
        typeof value.email === 'string' &&
        typeof value.address === 'string' &&
        typeof value.city === 'string');
}
function isOrderData(value) {
    return (isRecord(value) &&
        typeof value.id === 'number' &&
        typeof value.number === 'string' &&
        Array.isArray(value.items) &&
        value.items.every(isCartItem) &&
        isShippingInfo(value.shipping) &&
        typeof value.subtotal === 'number' &&
        typeof value.discount === 'number' &&
        typeof value.shippingCost === 'number' &&
        typeof value.total === 'number' &&
        typeof value.placedAt === 'string');
}
// Older saved carts have no promoCode and a damaged item must not break the whole cart.
function parseCartState(raw) {
    if (!isRecord(raw) || !Array.isArray(raw.items)) {
        return null;
    }
    const promo = raw.promoCode;
    return {
        items: raw.items.filter(isCartItem),
        promoCode: typeof promo === 'string' && Cart.isValidPromo(promo) ? Cart.PROMO_CODE : null,
    };
}
function parseReviewMap(raw) {
    if (!isRecord(raw)) {
        return null;
    }
    const result = {};
    for (const [productId, entry] of Object.entries(raw)) {
        if (Array.isArray(entry)) {
            result[productId] = entry.filter(isReview);
        }
    }
    return result;
}
function parseOrders(raw) {
    return Array.isArray(raw) ? raw.filter(isOrderData) : null;
}
const cartStorage = new StorageService(STORAGE_KEYS.cart, parseCartState);
const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, parseReviewMap);
const ordersStorage = new StorageService(STORAGE_KEYS.orders, parseOrders);
export function loadCartState() {
    return cartStorage.get() ?? { items: [], promoCode: null };
}
export function saveCartState(state) {
    cartStorage.set(state);
}
export function loadLocalReviews(productId) {
    return reviewsStorage.get()?.[String(productId)] ?? [];
}
export function saveLocalReviews(productId, reviews) {
    reviewsStorage.set({ ...(reviewsStorage.get() ?? {}), [String(productId)]: reviews });
}
export function loadOrders() {
    return ordersStorage.get() ?? [];
}
export function saveOrders(orders) {
    ordersStorage.set(orders);
}
// Used by "Clear local data": the session (React state) and the theme are not touched.
export function clearLocalData() {
    cartStorage.remove();
    ordersStorage.remove();
    reviewsStorage.remove();
}
