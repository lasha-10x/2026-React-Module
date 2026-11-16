// კალათის პროდუქტებს, რაოდენობებსა და ჯამურ ფასს მართავს.
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { useToast } from "./ToastContext";
import { useInventory } from "./InventoryContext";
import { readCartState, saveCartState } from "../utils/cartStorage";
import { CartManager } from "../utils/CartManager";
import { assertNever } from "../utils/assertNever";
// ახალი CartManager-ის გამოყენებით reducer-ის ძველ state-ს უცვლელად ვინარჩუნებთ.
export function cartReducer(state, action) {
    const manager = new CartManager(state);
    switch (action.type) {
        case "ADD_ITEM":
            return manager.addItem(action.product, action.quantity, action.stock, action.variants).success
                ? manager.state
                : state;
        case "REMOVE_ITEM":
            return manager.removeItem(action.productId, action.variants) ? manager.state : state;
        case "UPDATE_QUANTITY":
            return manager.updateQuantity(action.productId, action.quantity, action.stock, action.variants).success
                ? manager.state
                : state;
        case "CLEAR_CART":
            return manager.clearCart() ? manager.state : state;
        case "APPLY_PROMO":
            return manager.applyPromoCode(action.code) ? manager.state : state;
        case "REMOVE_PROMO":
            return manager.removePromoCode() ? manager.state : state;
        default:
            return assertNever(action);
    }
}
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const { addToast } = useToast();
    const { getStock } = useInventory();
    const [cart, dispatch] = useReducer(cartReducer, getStock, readCartState);
    const cartManager = useMemo(() => new CartManager(cart), [cart]);
    const { items, promoCode } = cart;
    useEffect(() => {
        // კალათის ყოველი ცვლილება localStorage-თან სინქრონდება.
        saveCartState(cart);
    }, [cart]);
    const addItem = (product, quantity, variants = {}) => {
        // დანართის flow-ში სტუმარსაც შეუძლია კალათის შევსება; Login საჭიროა Checkout-ზე.
        const stock = getStock(product.id, product.stock);
        const manager = new CartManager(cart);
        const result = manager.addItem(product, quantity, stock, variants);
        if (!result.success) {
            if (result.reason === "stock-limit") {
                if (import.meta.env.DEV)
                    console.log("[DEBUG 10X SHOP]: Cart add blocked by available stock.");
                addToast("Cannot add more than available stock.", "error");
            }
            return false;
        }
        dispatch({ type: "ADD_ITEM", product, quantity, stock, variants });
        if (import.meta.env.DEV)
            console.log("[DEBUG 10X SHOP]: Item added to cart.", { productId: product.id, quantity });
        if (result.limited)
            addToast("Cannot add more than available stock.", "error");
        addToast("Added to cart.", "success");
        return true;
    };
    const removeItem = (productId, variants = {}) => {
        const manager = new CartManager(cart);
        if (!manager.removeItem(productId, variants))
            return;
        dispatch({ type: "REMOVE_ITEM", productId, variants });
        if (import.meta.env.DEV)
            console.log("[DEBUG 10X SHOP]: Item removed from cart.", { productId });
        addToast("ITEM REMOVED", "info");
    };
    const updateQuantity = (productId, quantity, variants = {}) => {
        const currentItem = items.find((item) => item.productId === productId && item.size === variants.size && item.color === variants.color);
        if (!currentItem)
            return;
        const stock = getStock(productId, currentItem.stock);
        const manager = new CartManager(cart);
        const result = manager.updateQuantity(productId, quantity, stock, variants);
        if (!result.success) {
            if (result.reason === "stock-limit") {
                addToast("Cannot add more than available stock.", "error");
            }
            return;
        }
        dispatch({ type: "UPDATE_QUANTITY", productId, quantity, stock, variants });
        if (import.meta.env.DEV)
            console.log("[DEBUG 10X SHOP]: Cart quantity updated.", { productId, quantity });
        if (result.limited)
            addToast("Cannot add more than available stock.", "error");
    };
    const applyPromoCode = (code) => {
        const manager = new CartManager(cart);
        if (!manager.applyPromoCode(code))
            return false;
        dispatch({ type: "APPLY_PROMO", code });
        if (import.meta.env.DEV)
            console.log("[DEBUG 10X SHOP]: Promo code accepted.");
        return true;
    };
    const removePromoCode = () => {
        const manager = new CartManager(cart);
        if (manager.removePromoCode())
            dispatch({ type: "REMOVE_PROMO" });
    };
    const clearCart = () => {
        const hadItems = items.length > 0;
        const manager = new CartManager(cart);
        if (!manager.clearCart())
            return;
        dispatch({ type: "CLEAR_CART" });
        if (import.meta.env.DEV)
            console.log("[DEBUG 10X SHOP]: Cart cleared.");
        if (hadItems)
            addToast("CART CLEARED", "info");
    };
    // Header-ის badge და შეჯამება კალათის მიმდინარე მონაცემებიდან გამოითვლება.
    const itemCount = cartManager.itemCount;
    const { subtotal, discount, total } = cartManager.totals;
    const value = {
        items,
        promoCode,
        itemCount,
        subtotal,
        discount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        applyPromoCode,
        removePromoCode,
        clearCart,
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider.");
    }
    return context;
}
