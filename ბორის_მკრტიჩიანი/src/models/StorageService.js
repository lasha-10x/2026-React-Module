export const STORAGE_KEYS = {
    user: "shop_user",
    cart: "shop_cart",
    orders: "shop_orders",
    reviews: "shop_reviews",
    theme: "shop_theme",
};
export class StorageService {
    key;
    validator;
    constructor(key, validator) {
        this.key = key;
        this.validator = validator;
    }
    get() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            if (this.validator) {
                return this.validator(parsed) ? parsed : null;
            }
            return parsed;
        }
        catch (error) {
            console.error(`StorageService: Failed to read key "${this.key}":`, error);
            return null;
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch (error) {
            console.error(`StorageService: Failed to write key "${this.key}":`, error);
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch (error) {
            console.error(`StorageService: Failed to remove key "${this.key}":`, error);
        }
    }
}
