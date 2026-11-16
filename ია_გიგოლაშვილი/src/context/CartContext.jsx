import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { Cart } from "../models/Cart";
import { cartStorage } from "../models/storage";
import { EMPTY_CART, cartReducer, toCartItem } from "./cart.reducer";
const CartContext = createContext(null);
export function CartProvider({ children }) {
    // Lazy init: read shop_cart once, on the first render only.
    const [state, dispatch] = useReducer(cartReducer, EMPTY_CART, (initial) => cartStorage.get() ?? initial);
    // Persist after every change — the reducer itself stays pure.
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    // A ref lets addItem read the latest items while keeping a stable identity,
    // so memoised ProductCards do not re-render every time the cart changes.
    const itemsRef = useRef(state.items);
    useEffect(() => {
        itemsRef.current = state.items;
    }, [state.items]);
    const addItem = useCallback((item) => {
        if (item.stock <= 0)
            return "out-of-stock";
        const inCart = itemsRef.current.find((line) => line.productId === item.productId)?.quantity ?? 0;
        if (inCart + item.quantity > item.stock)
            return "limit-reached";
        dispatch({ type: "ADD_ITEM", item });
        return "added";
    }, []);
    const addProduct = useCallback((product, quantity = 1) => addItem(toCartItem(product, quantity)), [addItem]);
    const setQuantity = useCallback((productId, qty) => {
        dispatch({ type: "SET_QTY", productId, qty });
    }, []);
    const removeItem = useCallback((productId) => {
        dispatch({ type: "REMOVE_ITEM", productId });
    }, []);
    const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
    const applyPromo = useCallback((code) => {
        if (!Cart.isValidPromo(code))
            return false;
        dispatch({ type: "APPLY_PROMO", code });
        return true;
    }, []);
    const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);
    const value = useMemo(() => {
        const cart = new Cart(state.items, state.promoCode);
        return {
            items: state.items,
            promoCode: state.promoCode,
            cart,
            itemCount: cart.itemCount,
            getQuantity: (productId) => state.items.find((line) => line.productId === productId)?.quantity ?? 0,
            addItem,
            addProduct,
            setQuantity,
            removeItem,
            clear,
            applyPromo,
            removePromo,
        };
    }, [state, addItem, addProduct, setQuantity, removeItem, clear, applyPromo, removePromo]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context)
        throw new Error("useCart must be used inside <CartProvider>");
    return context;
}
