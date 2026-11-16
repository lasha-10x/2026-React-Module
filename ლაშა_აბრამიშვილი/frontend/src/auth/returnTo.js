import { isOrderId } from '../api/orders.js';
// Never accept an external URL, arbitrary path, query string, or hash as a post-login destination.
export function safeReturnTo(value) {
    if (value === '/products' || value === '/checkout' || value === '/orders' || value === '/account' || value === '/profile')
        return value;
    if (value?.startsWith('/orders/') && isOrderId(value.slice('/orders/'.length)))
        return value;
    return '/products';
}
export function authPath(mode, destination) {
    const safe = safeReturnTo(destination);
    return `/${mode}${safe === '/products' ? '' : `?returnTo=${encodeURIComponent(safe)}`}`;
}
