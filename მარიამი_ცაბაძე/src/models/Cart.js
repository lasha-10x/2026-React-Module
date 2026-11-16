import { discountedPrice } from '../utils/format';
export class Cart {
    items;
    promoCode;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    subtotal() {
        return this.items.reduce((sum, item) => sum +
            discountedPrice(item.price, item.discountPercentage) * item.quantity, 0);
    }
    discount() {
        return this.promoCode === '10X10'
            ? Math.round((this.subtotal() * 0.1 + Number.EPSILON) * 100) / 100
            : 0;
    }
    shipping() {
        return this.subtotal() >= Cart.FREE_SHIPPING_FROM || this.subtotal() === 0
            ? 0
            : Cart.SHIPPING_COST;
    }
    total() {
        return (Math.round((this.subtotal() - this.discount() + this.shipping() + Number.EPSILON) *
            100) / 100);
    }
}
