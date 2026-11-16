export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
export class ApiClient {
    baseUrl;
    constructor(baseUrl = 'https://dummyjson.com') {
        this.baseUrl = baseUrl;
    }
    async request(path, signal) { const timeout = new AbortController(); const timer = window.setTimeout(() => timeout.abort(), 10_000); const onAbort = () => timeout.abort(); signal?.addEventListener('abort', onAbort, { once: true }); try {
        const response = await fetch(`${this.baseUrl}${path}`, { signal: timeout.signal });
        if (!response.ok)
            throw new ApiError(response.status, `Request failed (${response.status})`);
        return await response.json();
    }
    catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError' && signal?.aborted)
            throw error;
        if (error instanceof DOMException && error.name === 'AbortError')
            throw new ApiError(408, 'The request timed out.');
        throw error;
    }
    finally {
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
    } }
    getProducts(params, signal) { return this.request(`/products${params}`, signal); }
    getProduct(id, signal) { return this.request(`/products/${id}`, signal); }
    getCategories(signal) { return this.request('/products/categories', signal); }
    getCategory(slug, params, signal) { return this.request(`/products/category/${encodeURIComponent(slug)}${params}`, signal); }
}
export const api = new ApiClient();
