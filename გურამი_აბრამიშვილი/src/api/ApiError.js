// HTTP / network failure with a status code (0 = no response at all).
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}
export function isApiError(e) {
    return e instanceof ApiError;
}
// Turns anything that was thrown (unknown!) into a human-readable sentence.
export function describeError(e) {
    if (isApiError(e)) {
        if (e.status === 0)
            return "Network error. Please check your connection and try again.";
        if (e.status === 404)
            return "We could not find what you were looking for.";
        if (e.status >= 500)
            return "The server had a problem. Please try again in a moment.";
        return `Request failed (${e.status}). Please try again.`;
    }
    if (e instanceof Error)
        return e.message;
    return "Something unexpected happened.";
}
