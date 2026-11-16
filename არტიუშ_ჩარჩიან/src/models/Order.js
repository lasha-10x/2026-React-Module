import { getOrderStatus } from '../utils/format';
export class OrderModel {
    value;
    constructor(value) {
        this.value = value;
    }
    get status() { return getOrderStatus(this.value); }
    get data() { return this.value; }
    static create(items, checkout, total) { return new OrderModel({ id: `10X-${Date.now().toString().slice(-6)}`, placedAt: new Date().toISOString(), items, checkout, total }); }
}
