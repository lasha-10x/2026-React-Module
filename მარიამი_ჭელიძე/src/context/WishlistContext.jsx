// სურვილების სიას ინახავს და მის ცვლილებებზე შეტყობინებებს აჩვენებს.
import { createContext, useCallback, useContext, useState } from "react";
import { useToast } from "./ToastContext";
const WISHLIST_KEY = "middle-market-wishlist";
const WishlistContext = createContext(undefined);
function isProduct(value) {
    if (typeof value !== "object" || value === null)
        return false;
    const record = value;
    return typeof record.id === "number" && typeof record.title === "string" &&
        typeof record.price === "number" && typeof record.category === "string" &&
        typeof record.thumbnail === "string";
}
function readWishlist() {
    // შენახული მონაცემებიდან მხოლოდ ვალიდურ პროდუქტის ჩანაწერებს ვტოვებთ.
    try {
        const value = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
        return Array.isArray(value) ? value.filter(isProduct) : [];
    }
    catch {
        return [];
    }
}
export function WishlistProvider({ children }) {
    const [items, setItems] = useState(readWishlist);
    const { addToast } = useToast();
    // ერთსა და იმავე პროდუქტს მეორედ არ ვამატებთ და ცვლილებას საცავში ვინახავთ.
    const addToWishlist = useCallback((product) => {
        if (items.some((item) => item.id === product.id))
            return;
        const next = [...items, product];
        setItems(next);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        addToast("ADDED TO WISHLIST", "success");
    }, [addToast, items]);
    const removeFromWishlist = useCallback((productId) => {
        const next = items.filter((product) => product.id !== productId);
        if (next.length === items.length)
            return;
        setItems(next);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        addToast("REMOVED FROM WISHLIST", "info");
    }, [addToast, items]);
    const isInWishlist = useCallback((productId) => items.some((item) => item.id === productId), [items]);
    const toggleWishlist = useCallback((product) => {
        if (items.some((item) => item.id === product.id))
            removeFromWishlist(product.id);
        else
            addToWishlist(product);
    }, [addToWishlist, items, removeFromWishlist]);
    return (<WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>);
}
export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined)
        throw new Error("useWishlist must be used within a WishlistProvider.");
    return context;
}
