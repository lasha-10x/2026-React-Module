/** HTTP response-ის წარუმატებლობასთან დაკავშირებული შეცდომა. */
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        // Error-ის მემკვიდრეობის ჯაჭვს სწორად ვინარჩუნებთ TypeScript-ის ტრანსპილაციისას.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
