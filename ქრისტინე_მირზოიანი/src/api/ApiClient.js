import { ApiError } from './ApiError';
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        };
        let res;
        try {
            res = await fetch(this.baseUrl + path, { ...init, headers });
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw err;
            }
            const msg = err instanceof Error ? err.message : 'Network connection failed';
            throw new ApiError(0, msg);
        }
        if (!res.ok) {
            const errText = await res.text().catch(() => 'Request failed');
            throw new ApiError(res.status, errText || `HTTP Error ${res.status}`);
        }
        return (await res.json());
    }
    get(path, signal) {
        return this.request(path, { method: 'GET', signal });
    }
    post(path, body, signal) {
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify(body),
            signal,
        });
    }
}
export const api = new ApiClient('https://dummyjson.com');
