import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { cartReducer } from './cart.reducer';
import { Cart } from '../types/cart';
import { cartStorage } from '../models/StorageService';
import { useToast } from './ToastContext';
const initialCartState = {
    items: [],
    promoCode: null,
};
function initCartState() {
    const stored = cartStorage.get();
    if (stored && Array.isArray(stored.items)) {
        const items = stored.items
            .filter((item) => Number.isInteger(item.stock) && item.stock > 0)
            .map((item) => ({
            ...item,
            quantity: Math.min(item.stock, Math.max(1, Math.floor(item.quantity))),
        }));
        return {
            items,
            promoCode: typeof stored.promoCode === 'string' ? stored.promoCode : null,
        };
    }
    return initialCartState;
}
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialCartState, initCartState);
    const { showToast } = useToast();
    useEffect(() => {
        cartStorage.set(state);
    }, [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode), [state.items, state.promoCode]);
    const addItem = (product, qty = 1) => {
        if (product.stock <= 0) {
            showToast('This product is out of stock', 'error');
            return false;
        }
        const currentItem = state.items.find((i) => i.productId === product.id);
        const currentQty = currentItem ? currentItem.quantity : 0;
        if (currentQty + qty > product.stock) {
            showToast(`Cannot add more than available stock (${product.stock})`, 'error');
            return false;
        }
        dispatch({ type: 'ADD_ITEM', product, qty });
        showToast('Added to cart ✓', 'success');
        return true;
    };
    const addItems = (items) => {
        const additions = new Map();
        for (const { product, qty } of items) {
            if (!Number.isInteger(qty) || qty <= 0 || !Number.isInteger(product.stock) || product.stock <= 0) {
                showToast('Unable to reorder: one or more items are unavailable', 'error');
                return false;
            }
            const existingAddition = additions.get(product.id);
            additions.set(product.id, {
                product: existingAddition
                    ? { ...product, stock: Math.min(product.stock, existingAddition.product.stock) }
                    : product,
                qty: (existingAddition?.qty ?? 0) + qty,
            });
        }
        for (const { product, qty } of additions.values()) {
            const currentQty = state.items.find((item) => item.productId === product.id)?.quantity ?? 0;
            if (currentQty + qty > product.stock) {
                showToast(`Unable to reorder: available stock for ${product.title} is insufficient`, 'error');
                return false;
            }
        }
        for (const { product, qty } of additions.values()) {
            dispatch({ type: 'ADD_ITEM', product, qty });
        }
        showToast('Items added to cart ✓', 'success');
        return true;
    };
    const setQuantity = (productId, qty) => {
        const currentItem = state.items.find((i) => i.productId === productId);
        if (currentItem && currentItem.stock <= 0) {
            dispatch({ type: 'REMOVE_ITEM', productId });
            showToast('Out-of-stock item removed from cart', 'info');
            return;
        }
        if (currentItem && qty > currentItem.stock) {
            showToast(`Cannot exceed available stock (${currentItem.stock})`, 'error');
            dispatch({ type: 'SET_QTY', productId, qty: currentItem.stock });
            return;
        }
        dispatch({ type: 'SET_QTY', productId, qty });
    };
    const removeItem = (productId) => {
        dispatch({ type: 'REMOVE_ITEM', productId });
        showToast('Removed from cart', 'info');
    };
    const clearCart = () => {
        dispatch({ type: 'CLEAR' });
    };
    const applyPromo = (code) => {
        const clean = code.trim().toUpperCase();
        if (clean === '10X10') {
            dispatch({ type: 'APPLY_PROMO', code: clean });
            showToast('Promo code 10X10 applied! (10% off)', 'success');
            return true;
        }
        else {
            showToast('Invalid promo code', 'error');
            return false;
        }
    };
    const removePromo = () => {
        dispatch({ type: 'REMOVE_PROMO' });
        showToast('Promo code removed', 'info');
    };
    return (<CartContext.Provider value={{
            state,
            cart,
            addItem,
            addItems,
            setQuantity,
            removeItem,
            clearCart,
            applyPromo,
            removePromo,
        }}>
        {children}
    </CartContext.Provider>);
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error('useCart must be used within CartProvider');
    return ctx;
}
