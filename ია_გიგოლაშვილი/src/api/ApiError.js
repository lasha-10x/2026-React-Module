/** HTTP error with a status code. status 0 = network failure (offline, DNS, CORS). */
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
    get isNotFound() {
        return this.status === 404;
    }
}
export function isApiError(error) {
    return error instanceof ApiError;
}
export function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
/** Turns anything that was thrown into a message we can show to the customer. */
export function getErrorMessage(error) {
    if (isApiError(error))
        return error.message;
    if (error instanceof Error)
        return error.message;
    return "Something went wrong. Please try again.";
}
