// the one gateway to browser storage: every read is parsed safely and checked by a type guard,
// so a missing, broken or old-shaped value comes back as null instead of crashing the app
export class StorageService {
    key;
    isValid;
    storage;
    constructor(key, isValid, storage = localStorage) {
        this.key = key;
        this.isValid = isValid;
        this.storage = storage;
    }
    get() {
        try {
            const raw = this.storage.getItem(this.key);
            if (raw === null)
                return null;
            const parsed = JSON.parse(raw);
            return this.isValid(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
    set(value) {
        this.storage.setItem(this.key, JSON.stringify(value));
    }
    remove() {
        this.storage.removeItem(this.key);
    }
}
