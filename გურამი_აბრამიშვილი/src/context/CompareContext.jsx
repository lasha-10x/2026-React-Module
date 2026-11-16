import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isProductList } from "@/utils/guards";
import { COMPARE_LIMIT, STORAGE_KEYS } from "@/utils/constants";
const CompareContext = createContext(null);
// Up to COMPARE_LIMIT products picked for the side-by-side table; persisted in localStorage.
export function CompareProvider({ children }) {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.compare, [], isProductList);
    const has = useCallback((id) => items.some((p) => p.id === id), [items]);
    const toggle = useCallback((product) => {
        if (items.some((p) => p.id === product.id)) {
            setItems(items.filter((p) => p.id !== product.id));
            return "removed";
        }
        if (items.length >= COMPARE_LIMIT)
            return "full";
        setItems([...items, product]);
        return "added";
    }, [items, setItems]);
    const remove = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), [setItems]);
    const clear = useCallback(() => setItems([]), [setItems]);
    const value = useMemo(() => ({ items, has, toggle, remove, clear }), [items, has, toggle, remove, clear]);
    return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export function useCompare() {
    const ctx = useContext(CompareContext);
    if (ctx === null)
        throw new Error("useCompare must be used inside <CompareProvider>");
    return ctx;
}
