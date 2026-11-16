import { ordersStorage } from "./storage";
export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered"];
export function loadOrders() {
    return ordersStorage.get() ?? [];
}
// ახალი შეკვეთა: id, ნომერი და თარიღი აქ ემატება
export function createOrder(data) {
    const count = loadOrders().length + 1;
    return {
        ...data,
        id: Date.now(),
        number: `10X-${String(count).padStart(5, "0")}`,
        placedAt: new Date().toISOString(),
    };
}
export function saveOrder(order) {
    ordersStorage.set([order, ...loadOrders()]);
}
// სტატუსი არ ინახება — ყოველ ჯერზე დროიდან ითვლება
export function getOrderStatus(order, now) {
    const minutes = (now - new Date(order.placedAt).getTime()) / 60000;
    if (minutes < 1)
        return "Processing";
    if (minutes < 3)
        return "Shipped";
    return "Delivered";
}
