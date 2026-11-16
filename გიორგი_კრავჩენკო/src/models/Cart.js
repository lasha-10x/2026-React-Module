import { discountedPrice } from '../utils/format';
import { Delivery } from './Delivery';
/**
 * Every price calculation in the application (Annex A, P4.3 and T4).
 *
 * The cart's arithmetic lives here rather than in a component because it is
 * the one piece of real business logic in the project: the cart page, the
 * checkout summary and the placed order must all agree, and they can only do
 * that by asking the same object. No React, no DOM, nothing to render - which
 * also makes it the one part that could be unit tested without a browser.
 */
export class Cart {
    items;
    promoCode;
    destination;
    /** The one promo code of P4.4. */
    static PROMO_CODE = '10X10';
    static PROMO_RATE = 0.1;
    constructor(items, promoCode, 
    /** The city the basket is going to, or null until one is chosen. */
    destination = null) {
        this.items = items;
        this.promoCode = promoCode;
        this.destination = destination;
    }
    /** Case-insensitive, as P4.4 requires. */
    static isValidPromo(code) {
        return code.trim().toUpperCase() === Cart.PROMO_CODE;
    }
    /** Total units, which is what the header badge shows. */
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    get isEmpty() {
        return this.items.length === 0;
    }
    /**
     * The sum of the discounted unit prices, rounded the same way they are
     * displayed, so the total always equals the lines the shopper can read.
     */
    subtotal() {
        return this.round(this.items.reduce((sum, item) => sum + discountedPrice(item.price, item.discountPercentage) * item.quantity, 0));
    }
    /** The promo code's share of the subtotal, or zero when none applies. */
    discount() {
        if (this.promoCode === null || !Cart.isValidPromo(this.promoCode))
            return 0;
        return this.round(this.subtotal() * Cart.PROMO_RATE);
    }
    /**
     * What it costs to bring this basket from storage to the customer.
     *
     * Delegated to `Delivery`, which finds the nearest warehouse stocking each
     * line and charges each journey by its distance. Until a destination has
     * been chosen there is no journey to price, so this is zero and the screens
     * say the charge is not known yet rather than claiming it is free.
     */
    shipping() {
        if (this.isEmpty)
            return 0;
        return this.delivery.total();
    }
    /** The journeys behind that figure, for the screens that show them. */
    deliveryPlan() {
        return this.delivery.plan();
    }
    /** True once a city has been chosen, so a charge can be quoted at all. */
    get hasDestination() {
        return this.deliveryPlan().destination !== null;
    }
    deliveryCache = null;
    /**
     * One Delivery per Cart, built on first use.
     *
     * It caches the plan it works out, so handing every caller the same
     * instance means the journeys are computed once however many times the
     * summary, the total and the panel each ask for them.
     *
     * A getter rather than a field initialised to `new Delivery(this.items, …)`,
     * because a field initialiser and the constructor's parameter properties
     * are assigned in an order that depends on the compile target - and if the
     * field won, it would read `this.items` before it had been set.
     */
    get delivery() {
        this.deliveryCache ??= new Delivery(this.items, this.destination);
        return this.deliveryCache;
    }
    total() {
        return this.round(this.subtotal() - this.discount() + this.shipping());
    }
    /** Money is kept at two decimals so the figures add up as displayed. */
    round(value) {
        return Math.round(value * 100) / 100;
    }
}
