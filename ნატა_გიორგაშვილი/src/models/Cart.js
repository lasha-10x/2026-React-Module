import { cartItemCount, cartSubtotal } from '../utils/cart';
function round2(value) {
    return Math.round(value * 100) / 100;
}
export class Cart {
    static PROMO_CODE = '10X10';
    static PROMO_RATE = 0.1;
    items;
    promoCode;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    static isValidPromo(code) {
        return code.trim().toUpperCase() === Cart.PROMO_CODE;
    }
    get itemCount() {
        return cartItemCount(this.items);
    }
    getItems() {
        return [...this.items];
    }
    subtotal() {
        return cartSubtotal(this.items);
    }
    discount() {
        return this.promoCode === null ? 0 : round2(this.subtotal() * Cart.PROMO_RATE);
    }
    total() {
        return round2(this.subtotal() - this.discount());
    }
}
