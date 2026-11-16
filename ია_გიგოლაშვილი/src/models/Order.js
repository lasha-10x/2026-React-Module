/**
 * Wraps a plain Order object (what we store in localStorage) with behaviour.
 * The status is never stored — it is derived from the time the order was placed.
 */
export class OrderModel {
    data;
    static SHIPPED_AFTER_MS = 60_000; // 1 minute
    static DELIVERED_AFTER_MS = 3 * 60_000; // 3 minutes
    static STATUSES = ["Processing", "Shipped", "Delivered"];
    constructor(data) {
        this.data = data;
    }
    /** Static factory: cart + form → new order. */
    static create({ cart, items, promoCode, shipping, sequence, now = new Date() }) {
        return new OrderModel({
            id: now.getTime(),
            number: OrderModel.formatNumber(sequence),
            items: items.map((item) => ({ ...item })),
            shipping: { ...shipping },
            promoCode: cart.hasPromo ? promoCode : null,
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: now.toISOString(),
        });
    }
    static from(data) {
        return new OrderModel(data);
    }
    static formatNumber(sequence) {
        return `10X-${String(sequence).padStart(5, "0")}`;
    }
    get itemCount() {
        return this.data.items.reduce((count, item) => count + item.quantity, 0);
    }
    /** Pure: same order + same time → same status. < 1 min Processing, 1–3 min Shipped, then Delivered. */
    getStatus(now = Date.now()) {
        const elapsed = now - Date.parse(this.data.placedAt);
        if (elapsed < OrderModel.SHIPPED_AFTER_MS)
            return "Processing";
        if (elapsed < OrderModel.DELIVERED_AFTER_MS)
            return "Shipped";
        return "Delivered";
    }
    toJSON() {
        return { ...this.data, items: this.data.items.map((item) => ({ ...item })) };
    }
}
