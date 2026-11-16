import { discountedPrice, round2 } from '../utils/format';
/** All cart arithmetic lives here - no React, so it is easy to reason about and to test. */
export class Cart {
    items;
    promoCode;
    static PROMO_CODE = '10X10';
    static PROMO_RATE = 0.1;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    /** Promo codes are case-insensitive. */
    static isValidPromo(code) {
        return code.trim().toUpperCase() === Cart.PROMO_CODE;
    }
    static unitPrice(item) {
        return discountedPrice(item.price, item.discountPercentage);
    }
    static lineTotal(item) {
        return round2(Cart.unitPrice(item) * item.quantity);
    }
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    get isEmpty() {
        return this.items.length === 0;
    }
    get hasPromo() {
        return this.promoCode !== null && Cart.isValidPromo(this.promoCode);
    }
    /** The code that is actually in effect, or null. */
    get appliedPromo() {
        return this.hasPromo ? Cart.PROMO_CODE : null;
    }
    get lineItems() {
        return this.items;
    }
    subtotal() {
        return round2(this.items.reduce((sum, item) => sum + Cart.lineTotal(item), 0));
    }
    discount() {
        return this.hasPromo ? round2(this.subtotal() * Cart.PROMO_RATE) : 0;
    }
    /** Free from $100 (after the promo discount); an empty cart ships nothing. */
    shipping() {
        if (this.isEmpty)
            return 0;
        return this.subtotal() - this.discount() >= Cart.FREE_SHIPPING_FROM ? 0 : Cart.SHIPPING_COST;
    }
    total() {
        return round2(this.subtotal() - this.discount() + this.shipping());
    }
}
