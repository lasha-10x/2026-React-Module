import { createContext, useContext, useEffect, useState } from 'react';
import { getCartTotal, getItemCount, toCartItem } from '../utils/cart';
import { loadCart, saveCart } from '../utils/storage';
const CartContext = createContext(null);
export function CartProvider({ children }) {
    // Lazy initial state: localStorage is read once, on the first render only.
    const [items, setItems] = useState(loadCart);
    // Persist after every change (shop_cart key).
    useEffect(() => {
        saveCart(items);
    }, [items]);
    function getQuantityInCart(productId) {
        const line = items.find((item) => item.productId === productId);
        return line ? line.quantity : 0;
    }
    function addItem(product, quantity) {
        const alreadyInCart = getQuantityInCart(product.id);
        if (quantity < 1 || alreadyInCart + quantity > product.stock) {
            return false;
        }
        setItems((prev) => {
            // Re-check against the newest state, not the items captured in this render
            const current = prev.find((item) => item.productId === product.id);
            const currentQty = current ? current.quantity : 0;
            if (currentQty + quantity > product.stock)
                return prev;
            return current
                ? prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
                : [...prev, toCartItem(product, quantity)];
        });
        return true;
    }
    function updateQuantity(productId, quantity) {
        setItems((prev) => prev.map((item) => item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, Math.floor(quantity)), item.stock) }
            : item));
    }
    function removeItem(productId) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    }
    function clearCart() {
        setItems([]);
    }
    const value = {
        items,
        itemCount: getItemCount(items),
        total: getCartTotal(items),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getQuantityInCart,
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart must be used inside <CartProvider>');
    }
    return context;
}
