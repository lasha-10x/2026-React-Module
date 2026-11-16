import { useEffect, useReducer } from 'react';
import { CartContext } from './CartContext';
import { cartReducer } from './cartReducer';
import { isCartItem } from '../utils/guards';
const STORAGE_KEY = 'shop_cart';
const loadCart = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return [];
        }
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
    }
    catch {
        return [];
    }
};
const CartProvider = ({ children }) => {
    // reducer იღებს მიმდინარე items-ს და action-ს, საწყისი მნიშვნელობა localStorage-იდან მოდის
    const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);
    const addItem = (newItem) => {
        dispatch({ type: 'add', item: newItem });
    };
    const removeItem = (productId) => {
        dispatch({ type: 'remove', productId });
    };
    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'setQuantity', productId, quantity });
    };
    const clearCart = () => {
        dispatch({ type: 'clear' });
    };
    const value = { items, addItem, removeItem, updateQuantity, clearCart };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
export default CartProvider;
