import { ApiError } from "./ApiError";
// ყველა API მოთხოვნის ერთი "კარიბჭე"
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async get(path, signal) {
        const response = await fetch(this.baseUrl + path, { signal });
        if (!response.ok) {
            throw new ApiError(response.status, `Request failed with status ${response.status}`);
        }
        return (await response.json());
    }
}
export const api = new ApiClient("https://dummyjson.com");
