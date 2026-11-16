// an HTTP error that keeps the status code, so callers can tell 404 from other failures
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
export function isApiError(error) {
    return error instanceof ApiError;
}
