import { calculateSubtotalCents, hasResolvedPrice } from './currency.js';
export class Cart {
    snapshot;
    constructor(snapshot) {
        this.snapshot = snapshot;
    }
    getTotals() {
        const { items, promoCode } = this.snapshot;
        if (!items.every(hasResolvedPrice))
            return undefined;
        const subtotalCents = calculateSubtotalCents(items);
        const promoDiscountCents = promoCode ? Math.round(subtotalCents / 10) : 0;
        // Shipping uses product-discounted subtotal before the cart promo.
        const shippingCents = items.length > 0 && subtotalCents < 10_000 ? 1_000 : 0;
        return {
            subtotalCents,
            promoDiscountCents,
            shippingCents,
            totalCents: subtotalCents - promoDiscountCents + shippingCents,
        };
    }
}
export function parsePromoCode(input) {
    return input.trim().toUpperCase() === '10X10' ? '10X10' : undefined;
}
