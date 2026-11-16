import { discountedUnitCents } from './currency.js';
export const orderStatuses = ['Processing', 'Shipped', 'Delivered'];
export function makeOrderLines(items) {
    return items.map((item) => {
        const unitPriceCents = discountedUnitCents(item);
        return { ...item, unitPriceCents, lineTotalCents: unitPriceCents * item.quantity };
    });
}
export class Order {
    snapshot;
    constructor(snapshot) {
        this.snapshot = snapshot;
    }
    static create(number, items, delivery, totals, promoCode, now = Date.now()) {
        return {
            id: crypto.randomUUID(),
            number,
            placedAt: new Date(now).toISOString(),
            items: makeOrderLines(items),
            delivery: { ...delivery },
            totals: { ...totals },
            promoCode,
        };
    }
    get label() {
        return `Order #10X-${String(this.snapshot.number).padStart(5, '0')}`;
    }
    get itemCount() {
        return this.snapshot.items.reduce((count, item) => count + item.quantity, 0);
    }
    statusAt(now) {
        const age = now - Date.parse(this.snapshot.placedAt);
        if (age < 60_000)
            return 'Processing';
        if (age <= 180_000)
            return 'Shipped';
        return 'Delivered';
    }
}
const orderDateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
export function formatOrderDate(date) {
    return orderDateFormat.format(new Date(date));
}
