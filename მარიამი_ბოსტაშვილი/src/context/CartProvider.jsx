import { useEffect, useMemo, useReducer } from "react";
import { isProduct } from "../api/products";
import { Cart, findPromoCode } from "../models/Cart";
import { StorageService } from "../services/StorageService";
import { STORAGE_KEYS } from "../services/storageKeys";
import { CartContext } from "./cart-context";
import { cartReducer, emptyCart } from "./cartReducer";
function isOptions(value) {
    return typeof value === "object" && value !== null && "color" in value && typeof value.color === "string" && "size" in value && typeof value.size === "string";
}
function isCartItem(value) {
    return (typeof value === "object" && value !== null &&
        "product" in value && isProduct(value.product) &&
        "quantity" in value && typeof value.quantity === "number" && Number.isInteger(value.quantity) && value.quantity > 0 &&
        (!("options" in value) || value.options === undefined || isOptions(value.options)));
}
function isCartState(value) {
    return (typeof value === "object" && value !== null &&
        "items" in value && Array.isArray(value.items) && value.items.every(isCartItem) &&
        "promoCode" in value && (value.promoCode === null || typeof value.promoCode === "string"));
}
const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState, emptyCart);
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, () => cartStorage.load());
    // Persist every change; logging out does not touch the cart.
    useEffect(() => {
        cartStorage.save(state);
    }, [state]);
    const promo = state.promoCode ? findPromoCode(state.promoCode) : null;
    const totals = useMemo(() => new Cart(state.items, state.promoCode).totals(), [state.items, state.promoCode]);
    const value = {
        items: state.items,
        promo,
        totals,
        addToCart: (product, quantity, options) => dispatch({ type: "ADD_ITEM", product, qty: quantity, options }),
        removeFromCart: (lineId) => dispatch({ type: "REMOVE_ITEM", lineId }),
        setQuantity: (lineId, quantity) => dispatch({ type: "SET_QTY", lineId, qty: quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        applyPromo: (code) => {
            if (!findPromoCode(code))
                return false;
            dispatch({ type: "APPLY_PROMO", code });
            return true;
        },
        removePromo: () => dispatch({ type: "REMOVE_PROMO" }),
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
