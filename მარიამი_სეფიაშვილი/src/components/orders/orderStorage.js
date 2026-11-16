import { isArrayOf, isOrderData } from "../../utils/guards";
import { STORAGE_KEYS } from "../../utils/storageKeys";
import { StorageService } from "../../models/StorageService";
import { Order } from "../../models/Order";
function isOrderDataList(value) {
    return isArrayOf(value, isOrderData);
}
const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderDataList);
export function readOrders() {
    return (ordersStorage.get() ?? []).map((data) => new Order(data));
}
export function placeOrder(cart, shipping) {
    const orders = readOrders();
    const order = Order.create(cart, shipping, `10X-${String(orders.length + 1).padStart(5, "0")}`);
    // each Order turns itself into plain data through toJSON()
    ordersStorage.set([...orders, order]);
    return order;
}
export function getOrderById(id) {
    return readOrders().find((order) => order.id === id) ?? null;
}
export function clearOrders() {
    ordersStorage.remove();
}
