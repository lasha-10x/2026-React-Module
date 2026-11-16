import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isProductList } from "@/utils/guards";
import { STORAGE_KEYS } from "@/utils/constants";
const WishlistContext = createContext(null);
// BONUS feature: wishlist persisted in localStorage.
export function WishlistProvider({ children }) {
    const [items, setItems] = useLocalStorage(STORAGE_KEYS.wishlist, [], isProductList);
    const has = useCallback((id) => items.some((p) => p.id === id), [items]);
    const toggle = useCallback((product) => {
        const exists = items.some((p) => p.id === product.id);
        setItems(exists ? items.filter((p) => p.id !== product.id) : [product, ...items]);
        return !exists;
    }, [items, setItems]);
    const clear = useCallback(() => setItems([]), [setItems]);
    const value = useMemo(() => ({ items, has, toggle, clear }), [items, has, toggle, clear]);
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (ctx === null)
        throw new Error("useWishlist must be used inside <WishlistProvider>");
    return ctx;
}
