import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { Cart } from "@/models/Cart";
import { StorageService } from "@/models/StorageService";
import { isCartState } from "@/utils/guards";
import { PROMO_CODE, STORAGE_KEYS } from "@/utils/constants";
import { cartReducer, emptyCart } from "./cart.reducer";
const CartContext = createContext(null);
const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
function initCart() {
    const stored = cartStorage.get();
    return stored === null
        ? emptyCart
        : { items: stored.items, promoCode: stored.promoCode ?? null, deliveryMethod: stored.deliveryMethod };
}
export function CartProvider({ children }) {
    // Lazy init: the third argument runs once, reading shop_cart.
    const [state, dispatch] = useReducer(cartReducer, emptyCart, initCart);
    // Persistence is a side effect, so it lives here and not in the (pure) reducer.
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode ?? null, state.deliveryMethod), [state]);
    const addItem = useCallback((product, qty = 1) => {
        if (product.stock <= 0)
            return { ok: false, message: "This product is out of stock" };
        const inCart = state.items.find((item) => item.productId === product.id)?.quantity ?? 0;
        if (inCart + qty > product.stock) {
            const message = inCart > 0
                ? `Only ${product.stock} in stock and you already have ${inCart} in your cart`
                : `Only ${product.stock} in stock`;
            return { ok: false, message };
        }
        dispatch({ type: "ADD_ITEM", product, qty });
        return { ok: true };
    }, [state.items]);
    const setQuantity = useCallback((productId, qty) => dispatch({ type: "SET_QTY", productId, qty }), []);
    const removeItem = useCallback((productId) => dispatch({ type: "REMOVE_ITEM", productId }), []);
    const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
    const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);
    const setDeliveryMethod = useCallback((method) => dispatch({ type: "SET_DELIVERY", method }), []);
    const applyPromo = useCallback((code) => {
        if (code.trim().toUpperCase() !== PROMO_CODE)
            return false;
        dispatch({ type: "APPLY_PROMO", code });
        return true;
    }, []);
    const value = useMemo(() => ({
        state,
        cart,
        itemCount: cart.itemCount,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
        setDeliveryMethod,
    }), [state, cart, addItem, setQuantity, removeItem, clearCart, applyPromo, removePromo, setDeliveryMethod]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (ctx === null)
        throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}
