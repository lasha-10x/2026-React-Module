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
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        let response;
        try {
            response = await fetch(`${this.baseUrl}${path}`, {
                ...init,
                headers: {
                    'Content-Type': 'application/json',
                    ...init.headers
                }
            });
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError')
                throw error;
            throw new ApiError(0, 'The product service is unavailable. Check your internet connection.');
        }
        if (!response.ok)
            throw new ApiError(response.status, (await response.text()) || `Request failed (${response.status}).`);
        return (await response.json());
    }
    get(path, signal) {
        return this.request(path, {
            signal
        });
    }
}
