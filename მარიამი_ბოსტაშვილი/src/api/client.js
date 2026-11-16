/** Structured API failure: an HTTP status error or a response with an unexpected shape. */
export class ApiError extends Error {
    status;
    kind;
    constructor(message, kind, status = null) {
        super(message);
        this.name = "ApiError";
        this.kind = kind;
        this.status = status;
    }
    get isNotFound() {
        return this.kind === "http" && this.status === 404;
    }
}
/** Type guard for errors caught as `unknown`. */
export function isApiError(error) {
    return error instanceof ApiError;
}
export function isRecord(value) {
    return typeof value === "object" && value !== null;
}
/**
 * Small typed HTTP client. Every response is read as `unknown` and must pass a
 * type guard before the rest of the app sees it, so `T` is checked at runtime,
 * not just asserted.
 */
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async get(path, isExpected, { signal } = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, { signal });
        if (!response.ok) {
            throw new ApiError(`Request to ${path} failed with status ${response.status}`, "http", response.status);
        }
        const data = await response.json();
        if (!isExpected(data)) {
            throw new ApiError(`Unexpected response shape from ${path}`, "invalid-response", response.status);
        }
        return data;
    }
}
