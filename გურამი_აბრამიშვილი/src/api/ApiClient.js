import { ApiError } from "./ApiError";
export class ApiClient {
    baseUrl;
    // The public products API needs no user authorization.
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        // Only requests with a body need Content-Type. On a plain GET it would trigger a needless CORS preflight.
        const headers = init.body === undefined ? {} : { "Content-Type": "application/json" };
        let res;
        try {
            res = await fetch(this.baseUrl + path, { ...init, headers });
        }
        catch (e) {
            // An aborted request is not an error to report: let the caller recognise it.
            if (e instanceof DOMException && e.name === "AbortError")
                throw e;
            throw new ApiError(0, "Network error");
        }
        if (!res.ok)
            throw new ApiError(res.status, await res.text());
        return (await res.json());
    }
    get(path, signal) {
        return this.request(path, { signal });
    }
    post(path, body, signal) {
        return this.request(path, { method: "POST", body: JSON.stringify(body), signal });
    }
}
