export const STORAGE_KEYS = {
    user: 'shop_user',
    accounts: 'shop_accounts',
    cart: 'shop_cart',
    orders: 'shop_orders',
    theme: 'shop_theme',
    reviews: 'shop_reviews'
};
export class StorageService {
    key;
    constructor(key) {
        this.key = key;
    }
    read() {
        try {
            const value = localStorage.getItem(this.key);
            return value ? JSON.parse(value) : null;
        }
        catch {
            return null;
        }
    }
    write(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch {
            /* Storage may be disabled. */
        }
    }
    clear() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            /* Storage may be disabled. */
        }
    }
    static get(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        }
        catch {
            return fallback;
        }
    }
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch {
            /* Storage may be disabled. */
        }
    }
    static remove(key) {
        try {
            localStorage.removeItem(key);
        }
        catch {
            /* Storage may be disabled. */
        }
    }
}
