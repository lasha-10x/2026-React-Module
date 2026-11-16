import { getItemCount, getSubtotal } from '../utils/cart';
function roundToCents(value) {
    return Math.round(value * 100) / 100;
}
// All cart arithmetic lives here, without any UI, so it can be tested on its own.
export class Cart {
    static PROMO_CODE = '10X10';
    static PROMO_RATE = 0.1;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    items;
    promoCode;
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    static isValidPromo(code) {
        return code.trim().toUpperCase() === Cart.PROMO_CODE;
    }
    // A copy, so callers cannot change the cart by accident.
    get lines() {
        return this.items.map((item) => ({ ...item }));
    }
    get itemCount() {
        return getItemCount(this.items);
    }
    get isEmpty() {
        return this.items.length === 0;
    }
    get hasPromo() {
        return this.promoCode !== null && Cart.isValidPromo(this.promoCode);
    }
    subtotal() {
        return getSubtotal(this.items);
    }
    discount() {
        return this.hasPromo ? roundToCents(this.subtotal() * Cart.PROMO_RATE) : 0;
    }
    // Shipping is free when the goods cost at least FREE_SHIPPING_FROM after the discount.
    shipping() {
        if (this.isEmpty) {
            return 0;
        }
        const goods = roundToCents(this.subtotal() - this.discount());
        return goods >= Cart.FREE_SHIPPING_FROM ? 0 : Cart.SHIPPING_COST;
    }
    total() {
        return roundToCents(this.subtotal() - this.discount() + this.shipping());
    }
}
