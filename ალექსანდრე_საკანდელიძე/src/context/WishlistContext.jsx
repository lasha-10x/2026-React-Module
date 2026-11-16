/**
 * NOTE: the wishlist, shared with every heart button and the wishlist page (BONUS).
 * Why it exists: a heart on any card has to know whether that product is saved, and the Header shows the count.
 * Passing that through props would mean threading it through every grid and card.
 * Connects to: `App.tsx` wraps the app in `WishlistProvider`. `useLocalStorage` saves it under `shop_wishlist`.
 *
 * It keeps each product's card fields, not just its id, so the page can draw the cards without asking the API again.
 */
import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import { parseWishlist } from "@/utils/guards";
const WishlistContext = createContext(null);
/** The product fields worth keeping, picked one by one. The full product also has reviews and photos, which aren't needed. */
function toSummary({ id, title, price, discountPercentage, rating, stock, thumbnail, category, brand }) {
    return { id, title, price, discountPercentage, rating, stock, thumbnail, category, brand };
}
/** Owns the saved list. Hearts read it through `useWishlist`, so a change only redraws the hearts, not the cards. */
export function WishlistProvider({ children }) {
    const [items, saveItems, clear] = useLocalStorage(STORAGE_KEYS.wishlist, [], parseWishlist);
    /** A Set makes each check instant. With 12 hearts on a page, none has to search the whole list. */
    const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);
    const has = useCallback((productId) => ids.has(productId), [ids]);
    const toggle = useCallback((product) => saveItems(ids.has(product.id) ? items.filter((item) => item.id !== product.id) : [toSummary(product), ...items]), [ids, items, saveItems]);
    const value = useMemo(() => ({ items, has, toggle, clear }), [items, has, toggle, clear]);
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
/** How components read the wishlist. Throws a clear message if the provider is missing. */
export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === null) {
        throw new Error("useWishlist must be used inside WishlistProvider.");
    }
    return context;
}
