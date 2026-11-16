import { PROMO_CODE, PROMO_DISCOUNT_RATE } from '../utils/constants';
export class Cart {
    items;
    promoCode;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    subtotal() { return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0); }
    discount() { return this.promoCode === PROMO_CODE ? this.subtotal() * PROMO_DISCOUNT_RATE : 0; }
    shipping() { return this.subtotal() === 0 || this.subtotal() >= Cart.FREE_SHIPPING_FROM ? 0 : Cart.SHIPPING_COST; }
    total() { return Math.max(0, this.subtotal() - this.discount() + this.shipping()); }
}
