import { createContext, useContext, useState, useEffect } from "react";
const OrderContext = createContext(undefined);
export function OrderProvider({ children }) {
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem("shop_orders");
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem("shop_orders", JSON.stringify(orders));
    }, [orders]);
    const addOrder = (items, total, shippingDetails) => {
        const newOrder = {
            id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleString(),
            items,
            total,
            shippingDetails,
        };
        setOrders(prev => [newOrder, ...prev]);
    };
    return (<OrderContext.Provider value={{ orders, addOrder }}>
            {children}
        </OrderContext.Provider>);
}
export function useOrders() {
    const context = useContext(OrderContext);
    if (!context)
        throw new Error("useOrders must be used within OrderProvider");
    return context;
}
