import { useEffect, useState } from 'react';
import { calculateTotals, isCartState } from '../utils/cart';
import { CartContext } from './cartContext';
const CART_STORAGE_KEY = 'shop_cart';
function loadCart() {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored === null) {
            return { items: [] };
        }
        const parsed = JSON.parse(stored);
        return isCartState(parsed) ? parsed : { items: [] };
    }
    catch {
        return { items: [] };
    }
}
function clampQuantity(quantity, stock) {
    return Math.min(Math.max(Math.trunc(quantity), 1), stock);
}
export function CartProvider({ children }) {
    const [cart, setCart] = useState(loadCart);
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }
        catch {
            // Storage can be unavailable (private mode or quota); the cart still works in memory.
        }
    }, [cart]);
    function addItem(product, quantity) {
        setCart((current) => {
            const existing = current.items.find((item) => item.productId === product.id);
            const maxQuantity = Math.max(product.stock, 0);
            if (maxQuantity === 0) {
                return current;
            }
            if (existing) {
                const updated = {
                    ...existing,
                    quantity: clampQuantity(existing.quantity + quantity, maxQuantity),
                };
                return {
                    items: current.items.map((item) => item.productId === product.id ? updated : item),
                };
            }
            const newItem = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: clampQuantity(quantity, maxQuantity),
            };
            return { items: [...current.items, newItem] };
        });
    }
    function setQuantity(productId, quantity) {
        setCart((current) => ({
            items: current.items.map((item) => item.productId === productId
                ? { ...item, quantity: clampQuantity(quantity, item.stock) }
                : item),
        }));
    }
    function removeItem(productId) {
        setCart((current) => ({
            items: current.items.filter((item) => item.productId !== productId),
        }));
    }
    function clearCart() {
        setCart({ items: [] });
    }
    const totals = calculateTotals(cart.items);
    return (<CartContext.Provider value={{
            items: cart.items,
            itemCount: totals.itemCount,
            subtotal: totals.subtotal,
            addItem,
            setQuantity,
            removeItem,
            clearCart,
        }}>
      {children}
    </CartContext.Provider>);
}
