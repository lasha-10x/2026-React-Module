const MINUTE_MS = 60_000;
export class Order {
    id;
    number;
    items;
    shipping;
    subtotal;
    discount;
    total;
    placedAt;
    constructor(data) {
        this.id = data.id;
        this.number = data.number;
        this.items = data.items;
        this.shipping = data.shipping;
        this.subtotal = data.subtotal;
        this.discount = data.discount;
        this.total = data.total;
        this.placedAt = data.placedAt;
    }
    static create(cart, shipping, sequence, now = new Date()) {
        return new Order({
            id: now.getTime(),
            number: `10X-${String(sequence).padStart(5, '0')}`,
            items: cart.getItems(),
            shipping,
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            total: cart.total(),
            placedAt: now.toISOString(),
        });
    }
    // Status is never stored: it is computed from the time passed since the order was placed.
    getStatus(now = new Date()) {
        const elapsed = now.getTime() - new Date(this.placedAt).getTime();
        if (elapsed < MINUTE_MS)
            return 'Processing';
        if (elapsed <= 3 * MINUTE_MS)
            return 'Shipped';
        return 'Delivered';
    }
    toJSON() {
        return {
            id: this.id,
            number: this.number,
            items: this.items,
            shipping: this.shipping,
            subtotal: this.subtotal,
            discount: this.discount,
            total: this.total,
            placedAt: this.placedAt,
        };
    }
}
