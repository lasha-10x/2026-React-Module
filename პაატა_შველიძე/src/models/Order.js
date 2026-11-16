import { getNextOrderNumber, getOrderStatus } from '../utils/orders';
export class Order {
    data;
    constructor(data) {
        this.data = data;
    }
    // Builds an order from the cart as it is right now. No card data exists in this project.
    static create(cart, shipping, existingOrders, now = new Date()) {
        return new Order({
            id: now.getTime(),
            number: getNextOrderNumber(existingOrders),
            items: cart.lines,
            shipping: { ...shipping },
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: now.toISOString(),
        });
    }
    static fromJSON(data) {
        return new Order(data);
    }
    get id() {
        return this.data.id;
    }
    // Does not change the order: the same input always gives the same answer.
    getStatus(now = new Date()) {
        return getOrderStatus(this.data.placedAt, now);
    }
    toJSON() {
        return { ...this.data, items: this.data.items.map((item) => ({ ...item })) };
    }
}
