/**
 * The only door to localStorage. One instance per key, and every value read back
 * has to pass the type guard - localStorage is user-editable text, not trusted data.
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
            // Blocked storage or broken JSON: behave as if nothing was saved.
            return null;
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch {
            /* quota exceeded or storage blocked - the app keeps working without persistence */
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            /* nothing to do */
        }
    }
}
