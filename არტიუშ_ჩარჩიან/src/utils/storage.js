export class StorageService {
    key;
    constructor(key) {
        this.key = key;
    }
    get() { try {
        const raw = localStorage.getItem(this.key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    } }
    set(value) { localStorage.setItem(this.key, JSON.stringify(value)); }
    remove() { localStorage.removeItem(this.key); }
}
export const cartStorage = new StorageService('shop_cart');
export const userStorage = new StorageService('shop_user');
export const orderStorage = new StorageService('shop_orders');
export const profileStorage = new StorageService('shop_profile');
