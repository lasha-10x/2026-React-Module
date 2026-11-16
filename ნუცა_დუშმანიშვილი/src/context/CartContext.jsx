import { createContext, useContext, useEffect, useState } from 'react';
import { discountedPrice } from '../utils/format';
const CartContext = createContext(undefined);
// Load saved cart items from localStorage when the app starts
function loadInitialCart() {
    try {
        const saved = localStorage.getItem('shop_cart');
        if (saved) {
            return JSON.parse(saved);
        }
    }
    catch {
        // If localStorage fails, start with an empty cart
    }
    return [];
}
export function CartProvider({ children }) {
    const [items, setItems] = useState(loadInitialCart);
    const [promoCode, setPromoCode] = useState(null);
    // Save cart items to localStorage whenever `items` changes
    useEffect(() => {
        try {
            localStorage.setItem('shop_cart', JSON.stringify(items));
        }
        catch {
            // Ignore storage errors
        }
    }, [items]);
    // 1. Add a product to the cart (using immutable state updates)
    function addItem(product, quantity = 1) {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.productId === product.id);
            // If product is already in the cart, increase its quantity (up to available stock)
            if (existingItem) {
                return prevItems.map((item) => item.productId === product.id
                    ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                    : item);
            }
            // Otherwise, add it as a new CartItem at the end of the array
            const newItem = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: Math.min(quantity, product.stock),
            };
            return [...prevItems, newItem];
        });
    }
    // 2. Remove a product from the cart using .filter()
    function removeItem(productId) {
        setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
    }
    // 3. Change the quantity of a product (between 1 and stock) using .map()
    function updateQuantity(productId, quantity) {
        setItems((prevItems) => prevItems.map((item) => {
            if (item.productId !== productId)
                return item;
            const safeQty = Math.max(1, Math.min(quantity, item.stock));
            return { ...item, quantity: safeQty };
        }));
    }
    // 4. Apply promo code "10X10" (case-insensitive) for a 10% discount [FULL]
    function applyPromoCode(code) {
        if (code.trim().toUpperCase() === '10X10') {
            setPromoCode('10X10');
            return true;
        }
        return false;
    }
    // 5. Remove applied promo code
    function removePromoCode() {
        setPromoCode(null);
    }
    // 6. Empty the entire cart (used on Cart page and after Checkout)
    function clearCart() {
        setItems([]);
        setPromoCode(null);
    }
    // Calculate total number of items (for Header badge), subtotal, discount, and final price
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + discountedPrice(item.price, item.discountPercentage) * item.quantity, 0);
    const discountAmount = promoCode === '10X10' ? totalPrice * 0.1 : 0;
    const finalPrice = totalPrice - discountAmount;
    return (<CartContext.Provider value={{
            items,
            totalItems,
            totalPrice,
            promoCode,
            discountAmount,
            finalPrice,
            addItem,
            removeItem,
            updateQuantity,
            applyPromoCode,
            removePromoCode,
            clearCart,
        }}>
      {children}
    </CartContext.Provider>);
}
// Helper hook to use CartContext inside any component
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
}
