export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
export function isApiError(e) {
    return (e instanceof ApiError ||
        (typeof e === "object" &&
            e !== null &&
            "status" in e &&
            typeof e.status === "number" &&
            "message" in e &&
            typeof e.message === "string"));
}
