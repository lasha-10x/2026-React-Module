import { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { cartReducer } from "./cart.reducer.js";
import { Cart } from "../models/Cart.js";
import { cartStorage } from "../models/StorageService.js";
import { useToast } from "./ToastContext.jsx";
const initialCartState = {
    items: [],
    promoCode: null,
};
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(cartReducer, initialCartState, () => {
        const saved = cartStorage.get();
        return saved && Array.isArray(saved.items) ? saved : initialCartState;
    });
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode ?? null), [state.items, state.promoCode]);
    const addItem = (product, qty = 1) => {
        if (product.stock <= 0) {
            showToast("This item is currently out of stock", "error");
            return false;
        }
        const existing = state.items.find((i) => i.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        if (currentQty + qty > product.stock) {
            showToast(`Cannot add more: Only ${product.stock} available in stock`, "error");
            return false;
        }
        dispatch({ type: "ADD_ITEM", product, qty });
        showToast("Added to cart ✓", "success");
        return true;
    };
    const setQuantity = (productId, qty) => {
        const item = state.items.find((i) => i.productId === productId);
        if (!item)
            return;
        if (qty > item.stock) {
            showToast(`Maximum available stock is ${item.stock}`, "error");
            return;
        }
        dispatch({ type: "SET_QTY", productId, qty });
    };
    const removeItem = (productId) => {
        dispatch({ type: "REMOVE_ITEM", productId });
        showToast("Removed from cart", "info");
    };
    const clearCart = () => {
        dispatch({ type: "CLEAR" });
    };
    const applyPromo = (code) => {
        const trimmed = code.trim().toUpperCase();
        if (trimmed === "10X10") {
            dispatch({ type: "APPLY_PROMO", code: trimmed });
            showToast("Promo code 10X10 applied! (10% off)", "success");
            return { success: true };
        }
        else {
            const err = "Invalid promo code";
            showToast(err, "error");
            return { success: false, error: err };
        }
    };
    const removePromo = () => {
        dispatch({ type: "REMOVE_PROMO" });
        showToast("Promo code removed", "info");
    };
    return (<CartContext.Provider value={{
            state,
            cart,
            items: state.items,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal(),
            discount: cart.discount(),
            shipping: cart.shipping(),
            total: cart.total(),
            promoCode: state.promoCode ?? null,
            addItem,
            setQuantity,
            removeItem,
            clearCart,
            applyPromo,
            removePromo,
            dispatch,
        }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
