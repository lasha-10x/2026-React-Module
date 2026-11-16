import { isCartItem } from './cart';
export function isOrder(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const order = value;
    const shipping = order.shipping;
    if (typeof shipping !== 'object' || shipping === null)
        return false;
    const shippingInfo = shipping;
    return Number.isInteger(order.id)
        && typeof order.number === 'string'
        && Array.isArray(order.items)
        && order.items.every(isCartItem)
        && typeof shippingInfo.fullName === 'string'
        && typeof shippingInfo.email === 'string'
        && typeof shippingInfo.phone === 'string'
        && typeof shippingInfo.address === 'string'
        && typeof shippingInfo.city === 'string'
        && typeof shippingInfo.country === 'string'
        && (shippingInfo.postalCode === undefined || typeof shippingInfo.postalCode === 'string')
        && (shippingInfo.paymentMethod === undefined || typeof shippingInfo.paymentMethod === 'string')
        && typeof order.subtotal === 'number'
        && typeof order.discount === 'number'
        && typeof order.shippingCost === 'number'
        && typeof order.total === 'number'
        && typeof order.placedAt === 'string';
}
export function isOrderArray(value) {
    return Array.isArray(value) && value.every(isOrder);
}
