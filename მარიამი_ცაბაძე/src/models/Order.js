export class Order {
    id;
    number;
    userId;
    items;
    shipping;
    subtotal;
    discount;
    shippingCost;
    total;
    placedAt;
    constructor(data) {
        this.id = data.id;
        this.number = data.number;
        this.userId = data.userId;
        this.items = data.items;
        this.shipping = data.shipping;
        this.subtotal = data.subtotal;
        this.discount = data.discount;
        this.shippingCost = data.shippingCost;
        this.total = data.total;
        this.placedAt = data.placedAt;
    }
    static create(cart, items, shipping, userId, sequence, now = new Date()) {
        const subtotal = cart.subtotal();
        const discount = cart.discount();
        const shippingCost = cart.shipping();
        return new Order({
            id: now.getTime() + sequence,
            number: `10X-${String(sequence).padStart(5, '0')}`,
            userId,
            items: structuredClone(items),
            shipping: {
                ...shipping
            },
            subtotal,
            discount,
            shippingCost,
            total: Math.round((subtotal - discount + shippingCost + Number.EPSILON) * 100) / 100,
            placedAt: now.toISOString()
        });
    }
    toJSON() {
        return {
            id: this.id,
            number: this.number,
            userId: this.userId,
            items: this.items,
            shipping: this.shipping,
            subtotal: this.subtotal,
            discount: this.discount,
            shippingCost: this.shippingCost,
            total: this.total,
            placedAt: this.placedAt
        };
    }
    getStatus(now = new Date()) {
        return Order.getStatus(this, now);
    }
    static getStatus(order, now = new Date()) {
        const elapsedMinutes = (now.getTime() - new Date(order.placedAt).getTime()) / 60_000;
        if (elapsedMinutes < 1)
            return 'Processing';
        if (elapsedMinutes <= 3)
            return 'Shipped';
        return 'Delivered';
    }
}
