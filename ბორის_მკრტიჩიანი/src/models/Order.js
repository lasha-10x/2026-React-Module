import { Cart, isCartItem } from "./Cart";
import { STORAGE_KEYS, StorageService } from "./StorageService";
function isShippingInfo(val) {
    if (typeof val !== "object" || val === null)
        return false;
    const s = val;
    return (typeof s.fullName === "string" &&
        typeof s.email === "string" &&
        typeof s.address === "string" &&
        typeof s.city === "string");
}
function isOrder(val) {
    if (typeof val !== "object" || val === null)
        return false;
    const o = val;
    return (typeof o.id === "number" &&
        typeof o.number === "string" &&
        Array.isArray(o.items) &&
        o.items.every(isCartItem) &&
        isShippingInfo(o.shipping) &&
        typeof o.subtotal === "number" &&
        typeof o.discount === "number" &&
        typeof o.shippingCost === "number" &&
        typeof o.total === "number" &&
        typeof o.placedAt === "string");
}
function isOrderArray(val) {
    return Array.isArray(val) && val.every(isOrder);
}
const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderArray);
export function getOrderStatus(order, now = new Date()) {
    const placedTime = new Date(order.placedAt).getTime();
    const elapsedMs = Math.max(0, now.getTime() - placedTime);
    const elapsedMinutes = elapsedMs / 60_000;
    if (elapsedMinutes < 1)
        return "Processing";
    if (elapsedMinutes <= 3)
        return "Shipped";
    return "Delivered";
}
export class OrderModel {
    data;
    constructor(data) {
        this.data = data;
    }
    static create(items, shipping, promoCode = null, ownerUsername) {
        const cart = new Cart(items, promoCode);
        const allOrders = ordersStorage.get() ?? [];
        const maxSeq = allOrders.reduce((max, ord) => {
            const match = /^10X-(\d+)$/.exec(ord.number);
            const num = match ? Number(match[1]) : 0;
            return Math.max(max, num);
        }, 0);
        const nextSeq = maxSeq + 1;
        const formattedNumber = `10X-${String(nextSeq).padStart(5, "0")}`;
        return {
            id: Date.now(),
            number: formattedNumber,
            ownerUsername: ownerUsername ? ownerUsername.trim().toLowerCase() : undefined,
            items: items.map((item) => ({ ...item })),
            shipping: { ...shipping },
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: new Date().toISOString(),
        };
    }
    getStatus(now = new Date()) {
        return getOrderStatus(this.data, now);
    }
    toJSON() {
        return { ...this.data };
    }
}
export function getSavedOrders(username) {
    const all = ordersStorage.get() ?? [];
    if (!username)
        return all;
    const normalized = username.trim().toLowerCase();
    return all.filter((order) => !order.ownerUsername || order.ownerUsername.toLowerCase() === normalized);
}
export function saveOrder(order) {
    const existing = ordersStorage.get() ?? [];
    ordersStorage.set([order, ...existing]);
}
