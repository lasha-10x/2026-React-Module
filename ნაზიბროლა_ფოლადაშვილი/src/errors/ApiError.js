export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
export function isApiError(error) {
    return error instanceof ApiError;
}
