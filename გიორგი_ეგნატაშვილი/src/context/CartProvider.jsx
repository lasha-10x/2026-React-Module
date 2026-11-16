import { useEffect, useState } from 'react';
import { CART_STORAGE_KEY, CartContext } from './cartContext';
/**
 * CartProvider — Global Cart State Provider with localStorage sync
 */
export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        }
        catch {
            return [];
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }
        catch (err) {
            console.error('Failed to save cart to localStorage', err);
        }
    }, [cart]);
    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item);
            }
            return [...prevCart, { product, quantity }];
        });
    };
    const updateQuantity = (productId, newQuantity) => {
        setCart((prevCart) => {
            if (newQuantity <= 0) {
                return prevCart.filter((item) => item.product.id !== productId);
            }
            return prevCart.map((item) => item.product.id === productId ? { ...item, quantity: newQuantity } : item);
        });
    };
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };
    const clearCart = () => {
        setCart([]);
    };
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return (<CartContext.Provider value={{
            cart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            totalCount,
            totalPrice,
        }}>
      {children}
    </CartContext.Provider>);
}
