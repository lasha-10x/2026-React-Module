import { getDiscountedPrice } from "../utils/price";
// every cart calculation (PRD P4.3) in one place and without React, so it can be checked on its own;
// the reducer still owns the cart state, this class only reads it
export class Cart {
    static PROMO_CODE = "10X10";
    static PROMO_PERCENT = 10;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    items;
    promoCode;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    // the price of one unit after the product's own discount
    static unitPrice(item) {
        return getDiscountedPrice(item.price, item.discountPercentage);
    }
    get itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    subtotal() {
        return this.items.reduce((sum, item) => sum + Cart.unitPrice(item) * item.quantity, 0);
    }
    discount() {
        return this.promoCode ? (this.subtotal() * Cart.PROMO_PERCENT) / 100 : 0;
    }
    // free from FREE_SHIPPING_FROM after the promo discount; an empty cart ships nothing
    shipping() {
        const afterDiscount = this.subtotal() - this.discount();
        return this.itemCount === 0 || afterDiscount >= Cart.FREE_SHIPPING_FROM ? 0 : Cart.SHIPPING_COST;
    }
    total() {
        return this.subtotal() - this.discount() + this.shipping();
    }
    totals() {
        return {
            itemCount: this.itemCount,
            subtotal: this.subtotal(),
            discount: this.discount(),
            shipping: this.shipping(),
            total: this.total(),
        };
    }
    // a copy of the contents, so an order keeps the cart as it was when it was placed
    toState() {
        return { items: [...this.items], promoCode: this.promoCode };
    }
}
