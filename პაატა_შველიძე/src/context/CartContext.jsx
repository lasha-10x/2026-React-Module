import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, } from 'react';
import { Cart } from '../models/Cart';
import { loadCartState, saveCartState } from '../utils/storage';
import { cartReducer, getAddError } from './cart.reducer';
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadCartState);
    useEffect(() => {
        saveCartState(state);
    }, [state]);
    const addItem = useCallback((product, quantity) => {
        const error = getAddError(state.items, product, quantity);
        if (error !== null) {
            return { added: false, message: error };
        }
        dispatch({ type: 'ADD_ITEM', product, qty: quantity });
        return { added: true, message: 'Added to cart ✓' };
    }, [state.items]);
    // Adds several products at once (reorder). Each one is checked against the running contents.
    const addItems = useCallback((entries) => {
        let working = state.items;
        let added = 0;
        let skipped = 0;
        for (const { product, qty } of entries) {
            if (getAddError(working, product, qty) !== null) {
                skipped += 1;
                continue;
            }
            const action = { type: 'ADD_ITEM', product, qty };
            working = cartReducer({ items: working, promoCode: null }, action).items;
            dispatch(action);
            added += 1;
        }
        return { added, skipped };
    }, [state.items]);
    const setQuantity = useCallback((productId, quantity) => {
        dispatch({ type: 'SET_QTY', productId, qty: quantity });
    }, []);
    const removeItem = useCallback((productId) => {
        dispatch({ type: 'REMOVE_ITEM', productId });
    }, []);
    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR' });
    }, []);
    const applyPromo = useCallback((code) => {
        if (!Cart.isValidPromo(code)) {
            return false;
        }
        dispatch({ type: 'APPLY_PROMO', code });
        return true;
    }, []);
    const removePromo = useCallback(() => {
        dispatch({ type: 'REMOVE_PROMO' });
    }, []);
    const cart = useMemo(() => new Cart(state.items, state.promoCode), [state]);
    const value = useMemo(() => ({
        items: state.items,
        promoCode: state.promoCode,
        cart,
        itemCount: cart.itemCount,
        addItem,
        addItems,
        setQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
    }), [state, cart, addItem, addItems, setQuantity, removeItem, clearCart, applyPromo, removePromo]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
}
