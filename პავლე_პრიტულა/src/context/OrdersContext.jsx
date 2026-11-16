import { createContext, useContext, useState } from 'react';
import { orderStorage, saveNewOrder } from '../utils/orderStorage';
const OrdersContext = createContext(undefined);
export function OrdersProvider({ children }) {
    const [orders, setOrders] = useState(() => {
        const stored = orderStorage.read();
        return stored.ok ? stored.value ?? [] : [];
    });
    function placeOrder(...input) {
        const saved = saveNewOrder(...input);
        if (!saved)
            return undefined;
        setOrders(saved.orders);
        return saved.order;
    }
    function clearOrders() {
        if (!orderStorage.remove())
            return false;
        setOrders([]);
        return true;
    }
    return <OrdersContext.Provider value={{ orders, placeOrder, clearOrders }}>{children}</OrdersContext.Provider>;
}
export function useOrders() {
    const context = useContext(OrdersContext);
    if (!context)
        throw new Error('OrdersProvider is required');
    return context;
}
