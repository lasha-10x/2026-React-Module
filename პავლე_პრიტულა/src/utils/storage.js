export const STORAGE_KEYS = {
    cart: 'shop_cart',
    reviews: 'shop_reviews',
    orders: 'shop_orders',
    theme: 'shop_theme',
    profiles: 'shop_profiles',
};
export class StorageService {
    key;
    decode;
    constructor(key, decode) {
        this.key = key;
        this.decode = decode;
    }
    read() {
        let raw;
        try {
            raw = window.localStorage.getItem(this.key);
        }
        catch {
            return { ok: false, reason: 'unavailable' };
        }
        if (raw === null)
            return { ok: true, value: undefined };
        try {
            const value = this.decode(JSON.parse(raw));
            return value === undefined ? { ok: false, reason: 'invalid' } : { ok: true, value };
        }
        catch {
            return { ok: false, reason: 'invalid' };
        }
    }
    write(value) {
        try {
            window.localStorage.setItem(this.key, JSON.stringify(value));
            return true;
        }
        catch {
            return false;
        }
    }
    remove() {
        try {
            window.localStorage.removeItem(this.key);
            return true;
        }
        catch {
            return false;
        }
    }
}
