import { StorageService, STORAGE_KEYS } from './storage';
export const AUTH_SESSION_VERSION = 1;
export function buildLocalUser(username) {
    const clean = username.trim();
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    return {
        id: 1001,
        username: clean,
        isLoggedIn: true,
        firstName: capitalized || 'Demo',
        lastName: 'Shopper',
        email: `${clean.toLowerCase()}@10xshop.local`,
        phone: ''
    };
}
export function loadUser() {
    const saved = StorageService.get(STORAGE_KEYS.user, null);
    if (typeof saved !== 'object' || saved === null)
        return null;
    if (!('authSessionVersion' in saved) ||
        saved.authSessionVersion !== AUTH_SESSION_VERSION) {
        StorageService.remove(STORAGE_KEYS.user);
        return null;
    }
    const item = saved;
    if (typeof item.username !== 'string' || !item.username.trim()) {
        StorageService.remove(STORAGE_KEYS.user);
        return null;
    }
    return {
        id: typeof item.id === 'number' ? item.id : 1001,
        username: item.username.trim(),
        isLoggedIn: true,
        firstName: item.firstName ?? 'Demo',
        lastName: item.lastName ?? 'Shopper',
        email: item.email ?? `${item.username.trim().toLowerCase()}@10xshop.local`,
        phone: item.phone ?? ''
    };
}
