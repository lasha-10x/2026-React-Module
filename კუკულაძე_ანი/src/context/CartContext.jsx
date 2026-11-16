import { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(null);
export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        const savedItems = localStorage.getItem('cart');
        if (savedItems) {
            try {
                return JSON.parse(savedItems);
            }
            catch {
                return [];
            }
        }
        return [];
    });
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);
    const addToCart = (product) => {
        if (product.stock <= 0)
            return;
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.product.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    return currentItems;
                }
                return currentItems.map((item) => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item);
            }
            return [...currentItems, { product, quantity: 1 }];
        });
    };
    const removeFromCart = (id) => {
        setItems((currentItems) => currentItems.filter((item) => item.product.id !== id));
    };
    const updateQuantity = (id, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1)
            return;
        setItems((currentItems) => currentItems.map((item) => {
            if (item.product.id !== id)
                return item;
            if (quantity > item.product.stock)
                return item;
            return { ...item, quantity };
        }));
    };
    const clearCart = () => {
        setItems([]);
    };
    return (<CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
}
