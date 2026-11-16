import { useEffect, useState, } from 'react';
import { CartContext } from './CartContextStore';
export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('shop_cart');
            if (!savedCart) {
                return [];
            }
            const parsed = JSON.parse(savedCart);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed;
        }
        catch {
            return [];
        }
    });
    // ყოველთვის, როდესაც items იცვლება, ვანახლებთ localStorage-ს
    useEffect(() => {
        localStorage.setItem('shop_cart', JSON.stringify(items));
    }, [items]);
    function addToCart(product) {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.product.id === product.id);
            if (existingItem) {
                return currentItems.map((item) => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item);
            }
            return [...currentItems, { product, quantity: 1 }];
        });
    }
    function removeFromCart(productId) {
        setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
    }
    function setQuantity(productId, quantity) {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems((currentItems) => currentItems.map((item) => item.product.id === productId
            ? { ...item, quantity }
            : item));
    }
    // კალათის სრული გაწმენდა (State + localStorage)
    function clearCart() {
        setItems([]);
        localStorage.removeItem('shop_cart');
    }
    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return (<CartContext.Provider value={{
            items,
            cartCount,
            totalPrice,
            addToCart,
            removeFromCart,
            setQuantity,
            clearCart,
        }}>
      {children}
    </CartContext.Provider>);
}
