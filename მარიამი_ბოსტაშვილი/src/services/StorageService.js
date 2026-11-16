/**
 * Typed wrapper around localStorage.
 * Each instance owns one key and validates stored data with a type guard,
 * so corrupted or outdated data falls back to a safe default instead of crashing the app.
 */
export class StorageService {
    key;
    isValid;
    fallback;
    constructor(key, isValid, fallback) {
        this.key = key;
        this.isValid = isValid;
        this.fallback = fallback;
    }
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw === null)
                return this.fallback;
            const data = JSON.parse(raw);
            return this.isValid(data) ? data : this.fallback;
        }
        catch {
            return this.fallback;
        }
    }
    save(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch {
            // Storage can be full or disabled (private mode); the in-memory state still works.
        }
    }
    clear() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // Storage can be disabled; there is nothing left to remove in that case.
        }
    }
}
