import { discountedPrice } from './format';
const ORDERS_STORAGE_KEY = 'shop_orders';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isOrderItem(value) {
    return isRecord(value)
        && typeof value.productId === 'number' && Number.isSafeInteger(value.productId) && value.productId > 0
        && typeof value.title === 'string' && value.title.trim().length > 0
        && typeof value.thumbnail === 'string' && value.thumbnail.trim().length > 0
        && typeof value.quantity === 'number' && Number.isSafeInteger(value.quantity) && value.quantity > 0
        && typeof value.unitPrice === 'number' && Number.isFinite(value.unitPrice) && value.unitPrice >= 0
        && Number.isFinite(value.unitPrice * value.quantity);
}
function isShipping(value) {
    return isRecord(value)
        && typeof value.fullName === 'string' && value.fullName.trim().length > 0
        && typeof value.email === 'string' && value.email.trim().length > 0
        && typeof value.address === 'string' && value.address.trim().length > 0
        && typeof value.city === 'string' && value.city.trim().length > 0;
}
function isOrder(value) {
    return isRecord(value)
        && typeof value.id === 'string' && /^\d+-\d+$/.test(value.id)
        && typeof value.number === 'string' && /^#10X-\d{5,}$/.test(value.number)
        && Number.isSafeInteger(Number(value.number.slice(5))) && Number(value.number.slice(5)) > 0
        && Array.isArray(value.items) && value.items.length > 0 && value.items.every(isOrderItem)
        && new Set(value.items.map((item) => item.productId)).size === value.items.length
        && isShipping(value.shipping)
        && typeof value.subtotal === 'number' && Number.isFinite(value.subtotal) && value.subtotal >= 0
        && typeof value.total === 'number' && Number.isFinite(value.total) && value.total >= 0
        && typeof value.placedAt === 'number' && Number.isSafeInteger(value.placedAt) && value.placedAt > 0
        && !Number.isNaN(new Date(value.placedAt).getTime());
}
export function readOrders() {
    try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (!saved)
            return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed))
            return [];
        const seenIds = new Set();
        const seenNumbers = new Set();
        return parsed.filter((value) => {
            if (!isOrder(value) || seenIds.has(value.id) || seenNumbers.has(value.number))
                return false;
            seenIds.add(value.id);
            seenNumbers.add(value.number);
            return true;
        });
    }
    catch {
        return [];
    }
}
export function saveOrder(items, shipping, subtotal, total) {
    if (items.length === 0)
        throw new Error('Cannot save an empty order');
    const previous = readOrders();
    const nextNumber = previous.reduce((largest, order) => Math.max(largest, Number(order.number.slice(5))), 0) + 1;
    const placedAt = Date.now();
    const order = {
        id: `${placedAt}-${nextNumber}`,
        number: `#10X-${String(nextNumber).padStart(5, '0')}`,
        items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            thumbnail: item.thumbnail,
            quantity: item.quantity,
            unitPrice: discountedPrice(item.price, item.discountPercentage),
        })),
        shipping: {
            fullName: shipping.fullName.trim(),
            email: shipping.email.trim(),
            address: shipping.address.trim(),
            city: shipping.city.trim(),
        },
        subtotal,
        total,
        placedAt,
    };
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...previous, order]));
    return order;
}
