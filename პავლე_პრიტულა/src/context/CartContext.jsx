import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { getProduct } from '../utils/api';
import { cartReducer } from './cartReducer';
import { Cart } from '../utils/cart';
import { readCart, saveCart } from '../utils/cartStorage';
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, undefined, readCart);
    const addItem = useCallback((product, quantity) => {
        dispatch({ type: 'add', product, quantity });
    }, []);
    const [failedIds, setFailedIds] = useState([]);
    const unresolved = cart.items.filter((item) => item.discountPercentage === undefined);
    const pendingIds = unresolved.filter((item) => !failedIds.includes(item.productId))
        .map((item) => item.productId).join(',');
    const { items, promoCode } = cart;
    useEffect(() => {
        saveCart({ items, promoCode });
    }, [items, promoCode]);
    useEffect(() => {
        if (!pendingIds)
            return;
        const ids = pendingIds.split(',').map(Number);
        const controller = new AbortController();
        void Promise.allSettled(ids.map((id) => getProduct(id, controller.signal))).then((results) => {
            if (controller.signal.aborted)
                return;
            const prices = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
            const failures = ids.filter((_, index) => results[index].status === 'rejected');
            if (prices.length)
                dispatch({ type: 'resolve-prices', prices });
            if (failures.length)
                setFailedIds((current) => [...current, ...failures]);
        });
        return () => controller.abort();
    }, [pendingIds]);
    return (<CartContext.Provider value={{
            ...cart,
            totals: new Cart(cart).getTotals(),
            addItem,
            removeItem: (productId) => dispatch({ type: 'remove', productId }),
            setQuantity: (productId, quantity) => dispatch({ type: 'set-quantity', productId, quantity }),
            clearCart: () => dispatch({ type: 'clear' }),
            clearSavedCart: () => {
                if (!saveCart({ items: [] }))
                    return false;
                dispatch({ type: 'clear' });
                return true;
            },
            reorder: (id, entries, requested) => dispatch({ type: 'reorder', id, entries, requested }),
            applyPromo: (code) => dispatch({ type: 'apply-promo', code }),
            removePromo: () => dispatch({ type: 'remove-promo' }),
            priceLoadFailed: unresolved.some((item) => failedIds.includes(item.productId)),
            retryPrices: () => setFailedIds([]),
        }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined)
        throw new Error('useCart must be used within CartProvider');
    return context;
}
