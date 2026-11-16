import { StorageService } from './StorageService';
/**
 * Every localStorage key the application uses (Annex A1.5, T3).
 *
 * `as const` makes each value a literal type rather than `string`, so a
 * mistyped key is a compile error instead of a quietly empty read.
 */
export const STORAGE_KEYS = {
    cart: 'shop_cart',
    user: 'shop_user',
    orders: 'shop_orders',
    reviews: 'shop_reviews',
    theme: 'shop_theme',
};
export const cartStorage = new StorageService(STORAGE_KEYS.cart);
export const userStorage = new StorageService(STORAGE_KEYS.user);
export const orderStorage = new StorageService(STORAGE_KEYS.orders);
export const reviewStorage = new StorageService(STORAGE_KEYS.reviews);
export const themeStorage = new StorageService(STORAGE_KEYS.theme);
