export const STORAGE_KEYS = {
    cart: "shop_cart",
    orders: "shop_orders",
    reviews: "shop_reviews",
    theme: "shop_theme",
    user: "shop_user",
};
export class StorageService {
    key;
    constructor(key) {
        this.key = key;
    }
    get() {
        try {
            const item = localStorage.getItem(this.key);
            if (!item) {
                return null;
            }
            return JSON.parse(item);
        }
        catch {
            return null;
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch {
            // storage unavailable
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // storage unavailable
        }
    }
}
