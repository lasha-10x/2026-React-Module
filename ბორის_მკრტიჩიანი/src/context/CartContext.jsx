import { createContext, useContext, useEffect, useMemo, useReducer, } from "react";
import { Cart, cartReducer, isCartItem, isCartState } from "../models/Cart";
import { STORAGE_KEYS, StorageService } from "../models/StorageService";
const CartContext = createContext(undefined);
const cartStateStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
const getInitialCartState = () => {
    const savedState = cartStateStorage.get();
    if (savedState)
        return savedState;
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.cart);
        if (!raw)
            return { items: [], promoCode: null };
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return { items: parsed.filter(isCartItem), promoCode: null };
        }
    }
    catch (error) {
        console.error("Failed to read legacy cart from localStorage:", error);
    }
    return { items: [], promoCode: null };
};
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, undefined, getInitialCartState);
    useEffect(() => {
        cartStateStorage.set(state);
    }, [state]);
    const cartModel = useMemo(() => new Cart(state.items, state.promoCode), [state.items, state.promoCode]);
    const addItem = (product, qty = 1) => {
        dispatch({ type: "ADD_ITEM", product, qty });
    };
    const removeItem = (productId) => {
        dispatch({ type: "REMOVE_ITEM", productId });
    };
    const setQuantity = (productId, quantity) => {
        dispatch({ type: "SET_QTY", productId, qty: quantity });
    };
    const clearCart = () => {
        dispatch({ type: "CLEAR" });
    };
    const applyPromo = (code) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === Cart.PROMO_CODE) {
            dispatch({ type: "APPLY_PROMO", code: normalized });
            return true;
        }
        return false;
    };
    const removePromo = () => {
        dispatch({ type: "REMOVE_PROMO" });
    };
    return (<CartContext.Provider value={{
            items: state.items,
            promoCode: state.promoCode,
            addItem,
            removeItem,
            setQuantity,
            clearCart,
            applyPromo,
            removePromo,
            totalItems: cartModel.itemCount,
            subtotal: cartModel.subtotal(),
            discount: cartModel.discount(),
            shippingCost: cartModel.shipping(),
            total: cartModel.total(),
        }}>
      {children}
    </CartContext.Provider>);
};
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
