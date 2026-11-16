import { FREE_SHIPPING_FROM, PROMO_CODE, PROMO_PERCENT, SHIPPING_COST } from "@/utils/constants";
import { lineTotal } from "@/utils/format";
/** Rounds to cents. Adding floating-point numbers can leave tiny remainders like 0.30000000000000004. */
function toCents(amount) {
    return Math.round(amount * 100) / 100;
}
export class Cart {
    items;
    promoCode;
    static FREE_SHIPPING_FROM = FREE_SHIPPING_FROM;
    static SHIPPING_COST = SHIPPING_COST;
    constructor(items, promoCode) {
        this.items = items;
        this.promoCode = promoCode;
    }
    /** True if this is the working promo code, in any letter case (PRD P4.4). */
    static isValidPromo(code) {
        return code.trim().toUpperCase() === PROMO_CODE;
    }
    /** The cart lines. A getter, so they can be read but the field itself stays private. */
    get lines() {
        return this.items;
    }
    /** Total units. Two of one product counts as 2. */
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    /** The sum of each line's price after its product discount. */
    subtotal() {
        return toCents(this.items.reduce((sum, item) => sum + lineTotal(item), 0));
    }
    /** How much the promo code takes off the subtotal. */
    discount() {
        return this.promoCode === null ? 0 : toCents((this.subtotal() * PROMO_PERCENT) / 100);
    }
    /** Free from the threshold upwards, counted after the promo discount, since that is what you really pay. */
    shipping() {
        if (this.items.length === 0 || this.subtotal() - this.discount() >= Cart.FREE_SHIPPING_FROM) {
            return 0;
        }
        return Cart.SHIPPING_COST;
    }
    total() {
        return toCents(this.subtotal() - this.discount() + this.shipping());
    }
}
