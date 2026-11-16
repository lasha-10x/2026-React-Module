const MINUTE = 60 * 1000;
// a placed order: created once from the cart and never changed; the status is worked out from its age, not stored
export class Order {
    id;
    createdAt;
    items;
    promoCode;
    totals;
    shipping;
    constructor(data) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.items = data.items;
        this.promoCode = data.promoCode;
        this.totals = data.totals;
        this.shipping = data.shipping;
    }
    // factory: takes a snapshot of the cart's items, promo code and totals at the moment of ordering
    static create(cart, shipping, id, now = new Date()) {
        const { items, promoCode } = cart.toState();
        return new Order({ id, createdAt: now.toISOString(), items, promoCode, totals: cart.totals(), shipping });
    }
    // Processing for the first minute, Shipped until minute 3, then Delivered
    getStatus(now = Date.now()) {
        const age = now - new Date(this.createdAt).getTime();
        if (age < MINUTE)
            return "Processing";
        if (age < 3 * MINUTE)
            return "Shipped";
        return "Delivered";
    }
    // JSON.stringify calls this, so localStorage gets a plain object
    toJSON() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            items: this.items,
            promoCode: this.promoCode,
            totals: this.totals,
            shipping: this.shipping,
        };
    }
}
