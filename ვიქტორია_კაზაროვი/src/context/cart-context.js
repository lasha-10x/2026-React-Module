import { createContext, useContext } from 'react';
export const CartContext = createContext(undefined);
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
