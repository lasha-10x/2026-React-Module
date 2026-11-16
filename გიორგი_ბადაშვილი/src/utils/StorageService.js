export class StorageService {
    key;
    constructor(key) {
        this.key = key;
    }
    get(defaultValue) {
        try {
            const storedData = localStorage.getItem(this.key);
            if (storedData === null) {
                return defaultValue;
            }
            return JSON.parse(storedData);
        }
        catch (error) {
            console.error(`Failed to read "${this.key}" from localStorage:`, error);
            return defaultValue;
        }
    }
    set(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
        }
        catch (error) {
            console.error(`Failed to save "${this.key}":`, error);
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch (error) {
            console.error(`Failed to remove "${this.key}":`, error);
        }
    }
}
