import { cartReducer, getCartTotals } from './cart.js';
import { usdToCents } from '../money.js';
export const CART_STORAGE_KEY = '10x-shop.cart.v1';
function isStoredItem(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const item = value;
    return typeof item.id === 'number' && Number.isSafeInteger(item.id) && item.id > 0
        && typeof item.title === 'string' && item.title.trim().length > 0
        && usdToCents(item.price) !== null
        && typeof item.thumbnail === 'string' && URL.canParse(item.thumbnail) && /^https?:\/\//.test(item.thumbnail)
        && typeof item.stock === 'number' && Number.isSafeInteger(item.stock) && item.stock > 0
        && typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity) && item.quantity > 0;
}
export function parseStoredCart(serialized) {
    if (!serialized)
        return { items: [] };
    try {
        const value = JSON.parse(serialized);
        if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1
            || !('items' in value) || !Array.isArray(value.items) || !value.items.every(isStoredItem))
            return { items: [] };
        return value.items.reduce((state, item) => {
            const next = cartReducer(state, { type: 'add', product: item, quantity: item.quantity });
            if (next === state)
                throw new RangeError('Invalid stored cart totals.');
            return next;
        }, { items: [] });
    }
    catch {
        return { items: [] };
    }
}
export function loadCart(storage) {
    try {
        return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
    }
    catch {
        return { items: [] };
    }
}
export function saveCart(storage, state) {
    try {
        getCartTotals(state);
        storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: state.items }));
        return true;
    }
    catch {
        return false;
    }
}
