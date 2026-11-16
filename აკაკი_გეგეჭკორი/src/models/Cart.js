import { discountedPrice } from "../utils/format";
const round2 = (value) => Math.round(value * 100) / 100;
export class Cart {
    items;
    promoCode;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    static VALID_PROMO = "10X10";
    static PROMO_RATE = 0.1;
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    subtotal() {
        return round2(this.items.reduce((sum, item) => sum +
            discountedPrice(item.price, item.discountPercentage) * item.quantity, 0));
    }
    promoDiscount() {
        if (this.promoCode?.toUpperCase() !== Cart.VALID_PROMO) {
            return 0;
        }
        return round2(this.subtotal() * Cart.PROMO_RATE);
    }
    discount() {
        return this.promoDiscount();
    }
    shipping() {
        if (this.items.length === 0 ||
            this.subtotal() - this.discount() >= Cart.FREE_SHIPPING_FROM) {
            return 0;
        }
        return Cart.SHIPPING_COST;
    }
    total() {
        return round2(Math.max(0, this.subtotal() - this.discount()) + this.shipping());
    }
}
