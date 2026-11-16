import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, } from 'react';
import { Cart } from '../models/Cart';
import { cartStorage } from '../models/storage';
import { cartReducer, checkAddItem, EMPTY_CART } from './cart.reducer';
const CartContext = createContext(null);
function loadInitialCart() {
    return cartStorage.get() ?? EMPTY_CART;
}
export function CartProvider({ children }) {
    // The third argument runs once, so localStorage is read only on the first render.
    const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);
    // Persist after every change (the reducer itself stays pure).
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode ?? null), [state]);
    // addItem reads the latest items from a ref, so it can keep one identity for the whole life of the
    // provider. A stable function lets memoized children skip re-rendering when the cart changes.
    const itemsRef = useRef(state.items);
    useEffect(() => {
        itemsRef.current = state.items;
    }, [state.items]);
    const addItem = useCallback((product, qty = 1) => {
        const result = checkAddItem(itemsRef.current, product, qty);
        if (result.ok)
            dispatch({ type: 'ADD_ITEM', product, qty });
        return result;
    }, []);
    const setQuantity = useCallback((productId, qty) => dispatch({ type: 'SET_QTY', productId, qty }), []);
    const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE_ITEM', productId }), []);
    const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
    const applyPromo = useCallback((code) => {
        if (!Cart.isValidPromo(code))
            return false;
        dispatch({ type: 'APPLY_PROMO', code });
        return true;
    }, []);
    const removePromo = useCallback(() => dispatch({ type: 'REMOVE_PROMO' }), []);
    const value = useMemo(() => ({
        items: state.items,
        promoCode: state.promoCode ?? null,
        cart,
        itemCount: cart.itemCount,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
    }), [state, cart, addItem, setQuantity, removeItem, clearCart, applyPromo, removePromo]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context)
        throw new Error('useCart must be used inside <CartProvider>');
    return context;
}
