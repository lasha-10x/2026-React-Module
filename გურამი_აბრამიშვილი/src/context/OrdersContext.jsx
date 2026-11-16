import { createContext, useCallback, useContext, useMemo } from "react";
import { Order } from "@/models/Order";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isOrderList } from "@/utils/guards";
import { STORAGE_KEYS } from "@/utils/constants";
const OrdersContext = createContext(null);
export function OrdersProvider({ children }) {
    const [orders, setOrders] = useLocalStorage(STORAGE_KEYS.orders, [], isOrderList);
    const placeOrder = useCallback((cart, shipping) => {
        const order = Order.create(cart, shipping, orders.length + 1).toJSON();
        setOrders((prev) => [order, ...prev]);
        return order;
    }, [orders.length, setOrders]);
    const clearOrders = useCallback(() => setOrders([]), [setOrders]);
    const value = useMemo(() => ({ orders, placeOrder, clearOrders }), [orders, placeOrder, clearOrders]);
    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
export function useOrders() {
    const ctx = useContext(OrdersContext);
    if (ctx === null)
        throw new Error("useOrders must be used inside <OrdersProvider>");
    return ctx;
}
