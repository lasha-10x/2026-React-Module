import { isCartState } from '../types/cart';
import { isOrderArray } from '../types/order';
import { isReviewsRecord } from '../types/products';
import { isAuthUser } from '../types/user';
import { isTheme } from '../types/theme';
export class StorageService {
    key;
    isValue;
    constructor(key, isValue) {
        this.key = key;
        this.isValue = isValue;
    }
    get() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (!this.isValue(parsed)) {
                console.warn(`[StorageService] Invalid stored data for key "${this.key}".`);
                return null;
            }
            return parsed;
        }
        catch (err) {
            console.warn(`[StorageService] Failed to parse item for key "${this.key}":`, err);
            return null;
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
            return true;
        }
        catch (err) {
            console.warn(`[StorageService] Failed to set item for key "${this.key}":`, err);
            return false;
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch (err) {
            console.warn(`[StorageService] Failed to remove item for key "${this.key}":`, err);
        }
    }
}
export const STORAGE_KEYS = {
    cart: 'shop_cart',
    orders: 'shop_orders',
    reviews: 'shop_reviews',
    theme: 'shop_theme',
    user: 'shop_user',
};
export const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
export const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderArray);
export const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, isReviewsRecord);
export const userStorage = new StorageService(STORAGE_KEYS.user, isAuthUser);
export const themeStorage = new StorageService(STORAGE_KEYS.theme, isTheme);
