/**
 * Safe localStorage helpers.
 * Storage can throw (Safari private mode, quota exceeded, disabled cookies) — never crash the app.
 */
export function storageGet(key) {
    try {
        return localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
export function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (e) {
        console.error(`Failed to write "${key}" to localStorage`, e);
    }
}
export function storageRemove(key) {
    try {
        localStorage.removeItem(key);
    }
    catch (e) {
        console.error(`Failed to remove "${key}" from localStorage`, e);
    }
}
export function storageGetJSON(key, fallback) {
    const raw = storageGet(key);
    if (!raw)
        return fallback;
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
