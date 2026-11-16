import { useEffect, useReducer, } from "react";
import { CartContext } from "./cart-context";
import { cartReducer, } from "./cart.reducer";
import { Cart } from "../models/Cart";
import { useAuth } from "./useAuth";
const LEGACY_CART_STORAGE_KEY = "10x-shop-cart";
const LEGACY_PROMO_STORAGE_KEY = "10x-shop-promo";
function getCartStorageKey(owner) {
    return `10x-shop-cart-${owner}`;
}
function getPromoStorageKey(owner) {
    return `10x-shop-promo-${owner}`;
}
function loadCart(owner) {
    let items = [];
    try {
        const savedCart = localStorage.getItem(getCartStorageKey(owner));
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
                items = parsed.filter((item) => {
                    if (typeof item !== "object" ||
                        item === null) {
                        return false;
                    }
                    const cartItem = item;
                    const product = cartItem.product;
                    return (typeof product === "object" &&
                        product !== null &&
                        typeof product.id === "number" &&
                        typeof product.title === "string" &&
                        typeof product.price === "number" &&
                        Number.isFinite(product.price) &&
                        typeof product.stock === "number" &&
                        Number.isInteger(product.stock) &&
                        product.stock > 0 &&
                        typeof cartItem.quantity === "number" &&
                        Number.isInteger(cartItem.quantity) &&
                        cartItem.quantity >= 1 &&
                        cartItem.quantity <= product.stock);
                });
            }
        }
    }
    catch (error) {
        console.error("Failed to load cart:", error);
    }
    let promoCode = null;
    try {
        const savedPromo = localStorage.getItem(getPromoStorageKey(owner));
        if (items.length > 0 &&
            savedPromo?.trim().toUpperCase() === "10X10") {
            promoCode = "10X10";
        }
    }
    catch (error) {
        console.error("Failed to load promo code:", error);
    }
    return {
        items,
        promoCode,
    };
}
function UserCartProvider({ owner, children, }) {
    const [state, dispatch] = useReducer(cartReducer, owner, loadCart);
    const { items, promoCode } = state;
    useEffect(() => {
        try {
            localStorage.setItem(getCartStorageKey(owner), JSON.stringify(items));
        }
        catch (error) {
            console.error("Failed to save cart:", error);
        }
    }, [owner, items]);
    useEffect(() => {
        try {
            if (promoCode && items.length > 0) {
                localStorage.setItem(getPromoStorageKey(owner), promoCode);
            }
            else {
                localStorage.removeItem(getPromoStorageKey(owner));
            }
        }
        catch (error) {
            console.error("Failed to save promo code:", error);
        }
    }, [owner, promoCode, items.length]);
    function addToCart(product, quantity = 1) {
        dispatch({
            type: "ADD_ITEM",
            product,
            qty: quantity,
        });
    }
    function removeFromCart(productId) {
        dispatch({
            type: "REMOVE_ITEM",
            productId,
        });
    }
    function updateQuantity(productId, quantity) {
        dispatch({
            type: "SET_QTY",
            productId,
            qty: quantity,
        });
    }
    function clearCart() {
        dispatch({
            type: "CLEAR",
        });
    }
    function applyPromo(code) {
        if (items.length === 0 ||
            code.trim().toUpperCase() !== "10X10") {
            return false;
        }
        dispatch({
            type: "APPLY_PROMO",
            code,
        });
        return true;
    }
    function removePromo() {
        dispatch({
            type: "REMOVE_PROMO",
        });
    }
    const cart = new Cart(items, promoCode);
    const totalItems = cart.itemCount;
    const subtotal = cart.subtotal();
    const discount = cart.discount();
    const shippingCost = cart.shipping();
    const totalPrice = cart.total();
    return (<CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            promoCode,
            discount,
            applyPromo,
            removePromo,
            totalItems,
            subtotal,
            shippingCost,
            totalPrice,
        }}>
            {children}
        </CartContext.Provider>);
}
export function CartProvider({ children, }) {
    const { username } = useAuth();
    const owner = username === null
        ? "guest"
        : `user-${encodeURIComponent(username)}`;
    return (<UserCartProvider key={owner} owner={owner}>
            {children}
        </UserCartProvider>);
}
// Legacy storage keys are intentionally preserved.
// Existing data remains available in localStorage
// and is not automatically assigned to another user.
void LEGACY_CART_STORAGE_KEY;
void LEGACY_PROMO_STORAGE_KEY;
