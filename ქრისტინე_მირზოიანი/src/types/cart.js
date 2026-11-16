import { discountedPrice } from '../utils/format';
export function isCartItem(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const item = value;
    return Number.isInteger(item.productId)
        && typeof item.title === 'string'
        && typeof item.price === 'number'
        && typeof item.discountPercentage === 'number'
        && typeof item.thumbnail === 'string'
        && Number.isInteger(item.quantity)
        && Number.isInteger(item.stock);
}
export function isCartState(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const state = value;
    return Array.isArray(state.items)
        && state.items.every(isCartItem)
        && (typeof state.promoCode === 'string' || state.promoCode === null);
}
export class Cart {
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    static PROMO_CODE_DISCOUNT_PERCENT = 10; // 10X10 code gives 10%
    items;
    promoCode;
    constructor(items, promoCode = null) {
        this.items = items;
        this.promoCode = promoCode;
    }
    get itemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    getItems() {
        return [...this.items];
    }
    getPromoCode() {
        return this.promoCode;
    }
    /**
     * Sum of discounted item price * quantity for all cart items
     */
    subtotal() {
        const raw = this.items.reduce((sum, item) => {
            const unitPrice = discountedPrice(item.price, item.discountPercentage);
            return sum + unitPrice * item.quantity;
        }, 0);
        return Math.round(raw * 100) / 100;
    }
    /**
     * Discount from active promo code (10X10 = 10%)
     */
    discount() {
        if (!this.promoCode || this.promoCode.toUpperCase() !== '10X10') {
            return 0;
        }
        const raw = this.subtotal() * (Cart.PROMO_CODE_DISCOUNT_PERCENT / 100);
        return Math.round(raw * 100) / 100;
    }
    /**
     * Shipping cost: $0 if subtotal >= 100 or empty, otherwise $10
     */
    shipping() {
        if (this.items.length === 0)
            return 0;
        if (this.subtotal() >= Cart.FREE_SHIPPING_FROM)
            return 0;
        return Cart.SHIPPING_COST;
    }
    /**
     * Final total = subtotal - discount + shipping
     */
    total() {
        if (this.items.length === 0)
            return 0;
        const finalVal = Math.max(0, this.subtotal() - this.discount() + this.shipping());
        return Math.round(finalVal * 100) / 100;
    }
}
