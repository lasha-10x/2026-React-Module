import { discountedPrice } from "../utils/format";
import { FREE_SHIPPING_FROM, PROMO_PERCENT, SHIPPING_COST, roundMoney, } from "../utils/cartRules";
// კალათის ყველა გამოთვლა — React-ის გარეშე
export class Cart {
    items;
    promoCode;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    subtotal() {
        return roundMoney(this.items.reduce((sum, item) => sum + discountedPrice(item.price, item.discountPercentage) * item.quantity, 0));
    }
    discount() {
        return this.promoCode ? roundMoney((this.subtotal() * PROMO_PERCENT) / 100) : 0;
    }
    shipping() {
        if (this.items.length === 0)
            return 0;
        return this.subtotal() - this.discount() >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    }
    total() {
        return roundMoney(this.subtotal() - this.discount() + this.shipping());
    }
}
