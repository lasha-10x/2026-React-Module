import { ApiError } from "./ApiError";
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        const headers = {
            "Content-Type": "application/json",
        };
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers: {
                ...headers,
                ...init.headers,
            },
        });
        if (!res.ok) {
            const text = await res.text();
            throw new ApiError(res.status, text || res.statusText);
        }
        return (await res.json());
    }
    get(path, signal) {
        return this.request(path, { signal });
    }
    post(path, body) {
        return this.request(path, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
}
export const apiClient = new ApiClient("https://dummyjson.com");
