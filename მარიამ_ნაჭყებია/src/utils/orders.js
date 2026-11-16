const STORAGE_KEY = 'shop_orders';
export const FREE_SHIPPING_FROM = 100;
export const SHIPPING_COST = 10;
export function getShippingCost(subtotal) {
    return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
}
function isOrder(x) {
    if (typeof x !== 'object' || x === null)
        return false;
    const o = x;
    return (typeof o.id === 'number' &&
        typeof o.number === 'string' &&
        Array.isArray(o.items) &&
        typeof o.shipping === 'object' &&
        o.shipping !== null &&
        typeof o.total === 'number' &&
        typeof o.placedAt === 'string');
}
export function loadOrders() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(isOrder) : [];
    }
    catch {
        return [];
    }
}
export function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}
export function getNextOrderNumber() {
    const highest = loadOrders().reduce((max, order) => {
        const n = Number(order.number.replace('10X-', ''));
        return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return `10X-${String(highest + 1).padStart(5, '0')}`;
}
export function saveOrder(order) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...loadOrders()]));
        return true;
    }
    catch {
        return false;
    }
}
