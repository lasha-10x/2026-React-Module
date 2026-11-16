import { discountedPrice, roundMoney } from "../utils/format";
/**
 * All cart maths in one UI-free, testable class.
 * React state stays the source of truth — a Cart is created from it with useMemo.
 */
export class Cart {
    items;
    promoCode;
    /** Free delivery on orders over $100 (after the promo discount). */
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 9.99;
    static PROMO_CODE = "10X10";
    static PROMO_RATE = 0.1;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    static isValidPromo(code) {
        return code.trim().toUpperCase() === Cart.PROMO_CODE;
    }
    static unitPrice(item) {
        return discountedPrice(item.price, item.discountPercentage);
    }
    static lineTotal(item) {
        return roundMoney(Cart.unitPrice(item) * item.quantity);
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
    /** Σ discounted unit price × quantity */
    subtotal() {
        return roundMoney(this.items.reduce((sum, item) => sum + Cart.lineTotal(item), 0));
    }
    discount() {
        return this.hasPromo ? roundMoney(this.subtotal() * Cart.PROMO_RATE) : 0;
    }
    /** What the free-delivery threshold is compared against. */
    merchandiseTotal() {
        return roundMoney(this.subtotal() - this.discount());
    }
    qualifiesForFreeShipping() {
        return this.merchandiseTotal() >= Cart.FREE_SHIPPING_FROM;
    }
    amountToFreeShipping() {
        return roundMoney(Math.max(0, Cart.FREE_SHIPPING_FROM - this.merchandiseTotal()));
    }
    shipping() {
        if (this.isEmpty || this.qualifiesForFreeShipping())
            return 0;
        return Cart.SHIPPING_COST;
    }
    total() {
        return roundMoney(this.merchandiseTotal() + this.shipping());
    }
}
