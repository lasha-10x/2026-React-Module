import { createContext, useContext } from 'react';
export const CART_STORAGE_KEY = '10x_shop_cart';
export const CartContext = createContext(undefined);
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
