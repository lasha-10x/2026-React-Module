import { discountedPrice } from "../utils/price";
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export class Cart {
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    items;
    promoCode;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    subtotal() {
        const amount = this.items.reduce((total, item) => {
            const { price, discountPercentage } = item.product;
            const unitPrice = discountPercentage >= 1
                ? discountedPrice(price, discountPercentage)
                : price;
            return total + roundMoney(unitPrice * item.quantity);
        }, 0);
        return roundMoney(amount);
    }
    discount() {
        if (this.promoCode?.toUpperCase() !== "10X10") {
            return 0;
        }
        return roundMoney(this.subtotal() * 0.1);
    }
    shipping() {
        if (this.items.length === 0) {
            return 0;
        }
        const amountAfterDiscount = roundMoney(this.subtotal() - this.discount());
        return amountAfterDiscount >= Cart.FREE_SHIPPING_FROM
            ? 0
            : Cart.SHIPPING_COST;
    }
    total() {
        return roundMoney(this.subtotal() - this.discount() + this.shipping());
    }
}
