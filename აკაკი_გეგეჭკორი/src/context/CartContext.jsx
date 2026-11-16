import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, } from "react";
import { Cart } from "../models/Cart";
import { cartStorage } from "../models/cartStorage";
import { cartReducer } from "./cart.reducer";
const CartContext = createContext(undefined);
const initialState = { items: [], promoCode: null };
function isCartItem(value) {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const item = value;
    return (typeof item.productId === "number" &&
        typeof item.title === "string" &&
        typeof item.thumbnail === "string" &&
        typeof item.price === "number" &&
        typeof item.discountPercentage === "number" &&
        typeof item.stock === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0);
}
function initCartState(fallback) {
    const stored = cartStorage.get();
    if (typeof stored !== "object" || stored === null) {
        return fallback;
    }
    const { items, promoCode } = stored;
    if (!Array.isArray(items)) {
        return fallback;
    }
    return {
        items: items.filter(isCartItem),
        promoCode: typeof promoCode === "string" ? promoCode : null,
    };
}
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState, initCartState);
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode), [state.items, state.promoCode]);
    const addItem = useCallback((product, qty = 1) => {
        const existing = state.items.find((i) => i.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        if (product.stock <= 0 || qty <= 0 || currentQty >= product.stock) {
            return { success: false, reachedLimit: true };
        }
        dispatch({ type: "ADD_ITEM", product, qty });
        return { success: true, reachedLimit: currentQty + qty >= product.stock };
    }, [state.items]);
    const removeItem = useCallback((productId) => {
        dispatch({ type: "REMOVE_ITEM", productId });
    }, []);
    const updateQuantity = useCallback((productId, qty) => {
        dispatch({ type: "SET_QTY", productId, qty });
    }, []);
    const clearCart = useCallback(() => {
        dispatch({ type: "CLEAR" });
    }, []);
    const applyPromo = useCallback((code) => {
        if (code.trim().toUpperCase() !== Cart.VALID_PROMO) {
            return false;
        }
        dispatch({ type: "APPLY_PROMO", code });
        return true;
    }, []);
    const removePromo = useCallback(() => {
        dispatch({ type: "REMOVE_PROMO" });
    }, []);
    const value = useMemo(() => ({
        items: state.items,
        promoCode: state.promoCode,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal(),
        discount: cart.discount(),
        shippingCost: cart.shipping(),
        total: cart.total(),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
    }), [
        state,
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
    ]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
