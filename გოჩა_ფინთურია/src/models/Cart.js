import { discountedPrice } from "../utils/format.js";
export class Cart {
    items;
    promoCode;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    static PROMO_DISCOUNT_PERCENT = 10; // 10% for promo code 10X10
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((acc, item) => acc + item.quantity, 0);
    }
    getItems() {
        return this.items;
    }
    getPromoCode() {
        return this.promoCode;
    }
    subtotal() {
        const raw = this.items.reduce((sum, item) => {
            const discounted = discountedPrice(item.price, item.discountPercentage);
            return sum + discounted * item.quantity;
        }, 0);
        return Math.round(raw * 100) / 100;
    }
    discount() {
        if (this.promoCode && this.promoCode.trim().toUpperCase() === "10X10") {
            const disc = (this.subtotal() * Cart.PROMO_DISCOUNT_PERCENT) / 100;
            return Math.round(disc * 100) / 100;
        }
        return 0;
    }
    shipping() {
        if (this.items.length === 0)
            return 0;
        const subAfterDiscount = this.subtotal() - this.discount();
        if (subAfterDiscount >= Cart.FREE_SHIPPING_FROM) {
            return 0;
        }
        return Cart.SHIPPING_COST;
    }
    total() {
        if (this.items.length === 0)
            return 0;
        const finalTotal = this.subtotal() - this.discount() + this.shipping();
        return Math.max(0, Math.round(finalTotal * 100) / 100);
    }
}
