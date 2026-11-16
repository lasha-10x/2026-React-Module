import { getFinalPrice } from "../utils/formatPrice";
/** Supported promo codes. Codes are matched case-insensitively. */
export const PROMO_CODES = {
    "10X10": { code: "10X10", percent: 10 },
};
export function findPromoCode(input) {
    return PROMO_CODES[input.trim().toUpperCase()] ?? null;
}
const roundCents = (value) => Math.round(value * 100) / 100;
/**
 * Immutable cart model. Item operations return a new Cart, so the reducer can
 * use them without mutating previous state; price rules live here, not in the UI.
 */
export class Cart {
    static FREE_SHIPPING_FROM = 100;
    static SHIPPING_COST = 10;
    items;
    promo;
    constructor(items = [], promoCode = null) {
        this.items = items;
        this.promo = promoCode ? findPromoCode(promoCode) : null;
    }
    get promoCodeValue() {
        return this.promo?.code ?? null;
    }
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    /** One line per product + colour + size, e.g. "12|Black|M". */
    static lineId(item) {
        return `${item.product.id}|${item.options?.color ?? ""}|${item.options?.size ?? ""}`;
    }
    /** Total quantity of a product across all of its colour/size lines. */
    quantityOf(productId) {
        return this.items
            .filter((item) => item.product.id === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    }
    add(product, quantity, options) {
        if (!Number.isInteger(quantity) || quantity < 1 || product.stock < 1)
            return this;
        // Stock is shared by every colour/size line of the same product.
        const allowed = Math.min(quantity, product.stock - this.quantityOf(product.id));
        if (allowed < 1)
            return this;
        const id = Cart.lineId({ product, options });
        const existing = this.items.find((item) => Cart.lineId(item) === id);
        if (existing) {
            return new Cart(this.items.map((item) => Cart.lineId(item) === id
                ? { ...item, quantity: item.quantity + allowed }
                : item), this.promo?.code ?? null);
        }
        return new Cart([...this.items, { product, quantity: allowed, options }], this.promo?.code ?? null);
    }
    setQuantity(lineId, quantity) {
        if (!Number.isInteger(quantity) || quantity < 1)
            return this;
        return new Cart(this.items.map((item) => {
            if (Cart.lineId(item) !== lineId)
                return item;
            const otherLines = this.quantityOf(item.product.id) - item.quantity;
            return {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.product.stock - otherLines)),
            };
        }), this.promo?.code ?? null);
    }
    remove(lineId) {
        return new Cart(this.items.filter((item) => Cart.lineId(item) !== lineId), this.promo?.code ?? null);
    }
    /** Σ discounted price × quantity. */
    subtotal() {
        return roundCents(this.items.reduce((sum, item) => sum + getFinalPrice(item.product) * item.quantity, 0));
    }
    /** Promo code discount on the subtotal. */
    discount() {
        return this.promo
            ? roundCents(this.subtotal() * (this.promo.percent / 100))
            : 0;
    }
    /** $10 shipping, free from $100 after discounts; nothing to ship for an empty cart. */
    shipping() {
        if (this.items.length === 0)
            return 0;
        return this.subtotal() - this.discount() >= Cart.FREE_SHIPPING_FROM
            ? 0
            : Cart.SHIPPING_COST;
    }
    total() {
        return roundCents(this.subtotal() - this.discount() + this.shipping());
    }
    totals() {
        const merchandise = this.subtotal() - this.discount();
        return {
            subtotal: this.subtotal(),
            discount: this.discount(),
            shipping: this.shipping(),
            total: this.total(),
            count: this.itemCount,
            freeShippingRemaining: this.items.length === 0
                ? 0
                : roundCents(Math.max(0, Cart.FREE_SHIPPING_FROM - merchandise)),
        };
    }
}
