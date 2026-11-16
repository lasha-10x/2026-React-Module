import { isCartItem } from './cartStorage.js';
import { isNonnegativeInteger, isRecord } from './decode.js';
import { Order } from './order.js';
import { STORAGE_KEYS, StorageService } from './storage.js';
function isOrderLine(value) {
    return isRecord(value) && isCartItem(value) && value.discountPercentage !== undefined &&
        isNonnegativeInteger(value.unitPriceCents) && isNonnegativeInteger(value.lineTotalCents) &&
        value.lineTotalCents === value.unitPriceCents * value.quantity;
}
function isOrder(value) {
    if (!isRecord(value) || typeof value.id !== 'string' || !/^[a-z0-9-]+$/i.test(value.id) ||
        !isNonnegativeInteger(value.number) || value.number < 1 ||
        typeof value.placedAt !== 'string' || !Number.isFinite(Date.parse(value.placedAt)) ||
        !Array.isArray(value.items) || !value.items.length || !value.items.every(isOrderLine) ||
        !isRecord(value.delivery) || !isRecord(value.totals) ||
        (value.promoCode !== undefined && value.promoCode !== '10X10'))
        return false;
    const { fullName, email, address, city } = value.delivery;
    const { subtotalCents, promoDiscountCents, shippingCents, totalCents } = value.totals;
    return [fullName, email, address, city].every((field) => typeof field === 'string' && field.trim() !== '') &&
        isNonnegativeInteger(subtotalCents) && isNonnegativeInteger(promoDiscountCents) &&
        isNonnegativeInteger(shippingCents) && isNonnegativeInteger(totalCents) &&
        promoDiscountCents <= subtotalCents &&
        totalCents === subtotalCents - promoDiscountCents + shippingCents &&
        subtotalCents === value.items.reduce((total, item) => total + item.lineTotalCents, 0);
}
export const orderStorage = new StorageService(STORAGE_KEYS.orders, (value) => {
    if (!Array.isArray(value) || !value.every(isOrder))
        return;
    if (new Set(value.map((order) => order.id)).size !== value.length)
        return;
    return value;
});
export function saveNewOrder(...input) {
    const stored = orderStorage.read();
    if (!stored.ok)
        return undefined;
    const previous = stored.value ?? [];
    const nextNumber = previous.reduce((max, order) => Math.max(max, order.number), 0) + 1;
    if (!Number.isSafeInteger(nextNumber))
        return undefined;
    const order = Order.create(nextNumber, ...input);
    const orders = [order, ...previous];
    return orderStorage.write(orders) ? { order, orders } : undefined;
}
