import { ORDER_STATUS_STEPS } from "@/utils/constants";
/** The next order number: the highest existing plus one, so deleting an order can't produce a duplicate. */
function nextOrderNumber(existing) {
    const highest = existing.reduce((max, order) => Math.max(max, Number(order.number.replace("10X-", "")) || 0), 0);
    return `10X-${String(highest + 1).padStart(5, "0")}`;
}
export class Order {
    id;
    number;
    items;
    shipping;
    subtotal;
    discount;
    shippingCost;
    total;
    placedAt;
    constructor(record) {
        this.id = record.id;
        this.number = record.number;
        this.items = record.items;
        this.shipping = record.shipping;
        this.subtotal = record.subtotal;
        this.discount = record.discount;
        this.shippingCost = record.shippingCost;
        this.total = record.total;
        this.placedAt = record.placedAt;
    }
    /** Makes a new order from the cart. The numbers are copied, so later cart changes can't alter it. */
    static create(cart, shipping, existing) {
        const now = new Date();
        return new Order({
            id: now.getTime(),
            number: nextOrderNumber(existing),
            items: cart.lines,
            shipping,
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: now.toISOString(),
        });
    }
    /** Rebuilds an Order from saved data, because localStorage only holds plain objects with no methods. */
    static from(record) {
        return new Order(record);
    }
    /**
     * The status is calculated from the time, never stored. One input, one answer, so it can't go out of date.
     * `now` is a parameter, so it can be tested with any moment in time.
     */
    getStatus(now = new Date()) {
        const elapsed = now.getTime() - new Date(this.placedAt).getTime();
        const step = ORDER_STATUS_STEPS.find((candidate) => elapsed < candidate.untilMs);
        return step?.status ?? "Delivered";
    }
    /** The plain data to save. JSON.stringify calls this method by itself. */
    toJSON() {
        return {
            id: this.id,
            number: this.number,
            items: this.items,
            shipping: this.shipping,
            subtotal: this.subtotal,
            discount: this.discount,
            shippingCost: this.shippingCost,
            total: this.total,
            placedAt: this.placedAt,
        };
    }
}
