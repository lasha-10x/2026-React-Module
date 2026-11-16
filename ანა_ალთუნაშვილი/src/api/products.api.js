import { buildProductsUrl } from '../utils/url';
/** The DummyJSON addresses the app uses, in one place. */
export const productsEndpoints = {
    list: (params) => buildProductsUrl(params),
    details: (id) => `/products/${id}`,
    categories: '/products/categories',
    byCategory: (slug, limit) => `/products/category/${encodeURIComponent(slug)}?limit=${limit}`,
};
