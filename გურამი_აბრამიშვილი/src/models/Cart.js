import { DEFAULT_DELIVERY_METHOD, PROMO_CODE, PROMO_PERCENT, getDeliveryMethod } from "@/utils/constants";
import { discountedPrice, round2 } from "@/utils/format";
// All price maths lives here, without any UI: easy to reason about and to test.
export class Cart {
    items;
    promoCode;
    method;
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    constructor(items, promoCode, method = DEFAULT_DELIVERY_METHOD) {
        this.items = items;
        this.promoCode = promoCode;
        this.method = method;
    }
    get deliveryMethod() {
        return this.method;
    }
    get lines() {
        return this.items;
    }
    get itemCount() {
        return this.items.reduce((n, item) => n + item.quantity, 0);
    }
    get isEmpty() {
        return this.items.length === 0;
    }
    get hasPromo() {
        return this.promoCode === PROMO_CODE;
    }
    static unitPrice(item) {
        return discountedPrice(item.price, item.discountPercentage);
    }
    static lineTotal(item) {
        return round2(Cart.unitPrice(item) * item.quantity);
    }
    subtotal() {
        return round2(this.items.reduce((sum, item) => sum + Cart.lineTotal(item), 0));
    }
    discount() {
        return this.hasPromo ? round2((this.subtotal() * PROMO_PERCENT) / 100) : 0;
    }
    shipping() {
        if (this.isEmpty)
            return 0;
        return Cart.shippingFor(this.method, this.subtotal() - this.discount());
    }
    // Price of one delivery method for an order amount (after discount); also used to list all options.
    static shippingFor(method, amountAfterDiscount) {
        const { cost, freeFrom } = getDeliveryMethod(method);
        return freeFrom !== undefined && amountAfterDiscount >= freeFrom ? 0 : cost;
    }
    total() {
        return round2(this.subtotal() - this.discount() + this.shipping());
    }
}
