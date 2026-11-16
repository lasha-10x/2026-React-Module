import { PROMO_CODE } from "@/utils/constants";
const MINUTE = 60_000;
export class Order {
    data;
    constructor(data) {
        this.data = data;
    }
    // Static factory: builds a new order from the current cart.
    static create(cart, shipping, sequence, now = new Date()) {
        return new Order({
            id: now.getTime(),
            number: `10X-${String(sequence).padStart(5, "0")}`,
            items: cart.lines.map((item) => ({ ...item })),
            shipping: { ...shipping },
            promoCode: cart.hasPromo ? PROMO_CODE : null,
            deliveryMethod: cart.deliveryMethod,
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: now.toISOString(),
        });
    }
    static from(data) {
        return new Order(data);
    }
    // The status is never stored: it is computed from the elapsed time (no state to keep in sync).
    static statusAt(placedAt, now) {
        const elapsed = now.getTime() - new Date(placedAt).getTime();
        if (elapsed < MINUTE)
            return "Processing";
        if (elapsed <= 3 * MINUTE)
            return "Shipped";
        return "Delivered";
    }
    getStatus(now = new Date()) {
        return Order.statusAt(this.data.placedAt, now);
    }
    toJSON() {
        return this.data;
    }
}
