export class StorageService {
    key;
    isValid;
    constructor(key, isValid) {
        this.key = key;
        this.isValid = isValid;
    }
    get() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw === null)
                return null;
            const data = JSON.parse(raw);
            return this.isValid(data) ? data : null;
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
            // Storage can be blocked or full; the app keeps working without persistence.
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // Nothing to do if storage is unavailable.
        }
    }
}
