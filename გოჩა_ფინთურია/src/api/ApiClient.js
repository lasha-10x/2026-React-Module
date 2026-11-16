import { ApiError } from "./ApiError.js";
export class ApiClient {
    baseUrl;
    constructor(baseUrl = "https://dummyjson.com") {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        };
        let res;
        try {
            res = await fetch(this.baseUrl + path, { ...init, headers });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Network error occurred";
            throw new ApiError(0, msg);
        }
        if (!res.ok) {
            let errText = "";
            try {
                errText = await res.text();
            }
            catch {
                errText = `HTTP error status ${res.status}`;
            }
            throw new ApiError(res.status, errText || `Request failed with status ${res.status}`);
        }
        return (await res.json());
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
