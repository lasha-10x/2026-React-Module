export const STORAGE_KEYS = Object.freeze({
    THEME: "shop_theme",
    CART: "shop_cart",
    ORDERS: "shop_orders",
    USER: "shop_user",
    REVIEWS: "shop_reviews",
});
/**
 * Safely retrieves and parses a typed value from localStorage with a fallback.
 */
export function getFromLocalStorage(key, fallback) {
    try {
        const storedItem = localStorage.getItem(key);
        if (storedItem === null) {
            return fallback;
        }
        return JSON.parse(storedItem);
    }
    catch (error) {
        console.error(`Error reading key "${key}" from localStorage:`, error);
        return fallback;
    }
}
/**
 * Safely serializes and saves a typed value to localStorage.
 */
export function setInLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error(`Error setting key "${key}" in localStorage:`, error);
    }
}
/**
 * Safely removes a key from localStorage.
 */
export function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    }
    catch (error) {
        console.error(`Error removing key "${key}" from localStorage:`, error);
    }
}
