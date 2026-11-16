import { ApiError } from "./ApiError";
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        const headers = {
            ...init.headers,
        };
        if (init.body !== undefined && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers,
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new ApiError(response.status, errorText || `HTTP Error ${response.status}: ${response.statusText}`);
        }
        return (await response.json());
    }
    get(path, signal) {
        return this.request(path, { method: "GET", signal });
    }
    post(path, body, signal) {
        return this.request(path, {
            method: "POST",
            body: JSON.stringify(body),
            signal,
        });
    }
}
export const apiClient = new ApiClient("https://dummyjson.com");
