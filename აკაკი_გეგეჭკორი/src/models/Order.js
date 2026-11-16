export class OrderModel {
    static create(params) {
        return {
            id: Date.now(),
            number: "10X-" + String(params.existingOrdersCount + 1).padStart(5, "0"),
            items: params.items,
            shipping: params.shipping,
            subtotal: params.subtotal,
            discount: params.discount,
            shippingCost: params.shippingCost,
            total: params.total,
            placedAt: new Date().toISOString(),
        };
    }
    static getStatus(placedAt, now = Date.now()) {
        const elapsed = now - new Date(placedAt).getTime();
        if (elapsed < 60_000) {
            return "Processing";
        }
        if (elapsed < 180_000) {
            return "Shipped";
        }
        return "Delivered";
    }
}
