/** An HTTP (or network) failure. status 0 means the request never reached the server. */
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
export function isApiError(error) {
    return error instanceof ApiError;
}
/** Anything thrown becomes a message that is safe to show to a user. */
export function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return 'Something went wrong. Please try again.';
}
