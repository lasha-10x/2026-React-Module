/**
 * NOTE: the saved orders, plus a clock for showing their live status (PRD P6).
 * Why it exists: Checkout adds orders and two pages read them, so that logic is written once.
 * Connects to: `useLocalStorage` saves under `shop_orders`. `models/Order.ts` holds the status rules.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Order } from "@/models/Order";
import { ORDER_REFRESH_MS, STORAGE_KEYS } from "@/utils/constants";
import { parseOrders } from "@/utils/guards";
import { useLocalStorage } from "./useLocalStorage";
/** Reads the saved orders and adds new ones. `records` stays as plain data, and `orders` wraps it in the `Order` class. */
export function useOrders() {
    const [records, setRecords, clearOrders] = useLocalStorage(STORAGE_KEYS.orders, [], parseOrders);
    const orders = useMemo(() => records.map(Order.from).sort((a, b) => b.id - a.id), [records]);
    const addOrder = useCallback((order) => setRecords([...records, order.toJSON()]), [records, setRecords]);
    return { orders, records, addOrder, clearOrders };
}
/**
 * The current time, refreshed on a timer, so a status can change while you watch it (PRD P6.2).
 * The defence question: "what happens without the cleanup?" Each visit would leave another interval running
 * forever, calling setState on a page that is gone. Each would hold memory, and they would pile up.
 */
export function useNow(intervalMs = ORDER_REFRESH_MS) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
