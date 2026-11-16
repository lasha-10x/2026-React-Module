/**
 * The only gateway to localStorage.
 * Generic over T and validated with a type guard, so a corrupted or outdated value
 * can never crash the app — it is simply treated as "nothing saved".
 */
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
            const parsed = JSON.parse(raw);
            return this.isValid(parsed) ? parsed : null;
        }
        catch {
            return null; // invalid JSON or storage blocked (private mode)
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch {
            /* storage full or blocked — the app keeps working from memory */
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            /* ignore */
        }
    }
}
