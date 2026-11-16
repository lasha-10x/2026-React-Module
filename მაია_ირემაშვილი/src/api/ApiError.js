// HTTP შეცდომა სტატუსით (მაგ. 404, 500)
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
// type guard: არის თუ არა შეცდომა ჩვენი ApiError
export function isApiError(error) {
    return error instanceof ApiError;
}
