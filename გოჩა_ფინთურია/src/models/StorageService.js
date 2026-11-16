export class StorageService {
    key;
    constructor(key) {
        this.key = key;
    }
    get() {
        try {
            const item = localStorage.getItem(this.key);
            if (!item)
                return null;
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
            // Storage quota or privacy mode error
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // ignore
        }
    }
}
export const STORAGE_KEYS = {
    cart: "shop_cart",
    orders: "shop_orders",
    theme: "shop_theme",
    reviews: "shop_reviews",
    user: "shop_user",
};
export const cartStorage = new StorageService(STORAGE_KEYS.cart);
export const ordersStorage = new StorageService(STORAGE_KEYS.orders);
export const themeStorage = new StorageService(STORAGE_KEYS.theme);
export const reviewsStorage = new StorageService(STORAGE_KEYS.reviews);
export const userStorage = new StorageService(STORAGE_KEYS.user);
