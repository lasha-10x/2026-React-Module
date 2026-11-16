export class OrderModel {
    static create(cart, items, shipping, paymentMethod = "Cash on delivery") {
        const id = Date.now();
        const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
        const number = `10X-${randomFiveDigit}`;
        return {
            id,
            number,
            items: [...items],
            shipping: { ...shipping },
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shippingCost: cart.shipping(),
            total: cart.total(),
            placedAt: new Date().toISOString(),
            paymentMethod,
        };
    }
    static getStatus(order, now = new Date()) {
        const placedTime = new Date(order.placedAt).getTime();
        const elapsedMinutes = (now.getTime() - placedTime) / (1000 * 60);
        if (elapsedMinutes < 1) {
            return "Processing";
        }
        else if (elapsedMinutes <= 3) {
            return "Shipped";
        }
        else {
            return "Delivered";
        }
    }
}
