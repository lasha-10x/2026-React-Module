// localStorage-ის ერთი "კარიბჭე" ნებისმიერი ტიპისთვის
export class StorageService {
    key;
    isValid;
    constructor(key, isValid) {
        this.key = key;
        this.isValid = isValid;
    }
    get() {
        try {
            const saved = localStorage.getItem(this.key);
            if (saved === null)
                return null;
            const parsed = JSON.parse(saved);
            return this.isValid(parsed) ? parsed : null;
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
            // localStorage შეიძლება სავსე ან მიუწვდომელი იყოს
        }
    }
    remove() {
        try {
            localStorage.removeItem(this.key);
        }
        catch {
            // იგივე მიზეზი
        }
    }
}
