// The single gateway to localStorage. JSON has no types, so every read goes through `revive`:
// it turns unknown data into a T, or returns null when the data is unusable.
export class StorageService {
    key;
    revive;
    constructor(key, revive) {
        this.key = key;
        this.revive = revive;
    }
    get() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw === null) {
                return null;
            }
            return this.revive(JSON.parse(raw));
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
            // Storage can be unavailable (private mode, quota): the data then lives in memory only.
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // Nothing to remove if storage is unavailable.
        }
    }
}
