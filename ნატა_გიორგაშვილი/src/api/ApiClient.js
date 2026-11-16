import { ApiError } from './ApiError';
export class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, init = {}) {
        const response = await fetch(this.baseUrl + path, init);
        if (!response.ok) {
            throw new ApiError(response.status, response.statusText || 'Request failed');
        }
        const data = await response.json();
        return data;
    }
    get(path, signal) {
        return this.request(path, { signal });
    }
}
