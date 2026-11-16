import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { Cart } from '../models/Cart';
import { cartReducer, cartStorage, loadCart } from '../services/cartState';
const CartContext = createContext(null);
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);
    useEffect(() => cartStorage.write(state), [state]);
    const cart = useMemo(() => new Cart(state.items, state.promoCode ?? null), [state]);
    const value = useMemo(() => ({
        state,
        count: cart.itemCount,
        subtotal: cart.subtotal(),
        discount: cart.discount(),
        shipping: cart.shipping(),
        total: cart.total(),
        add: (product, qty = 1) => {
            const line = state.items.find((item) => item.productId === product.id);
            if (product.stock < 1 ||
                qty < 1 ||
                qty > product.stock ||
                (line && line.quantity + qty > product.stock))
                return false;
            dispatch({ type: 'ADD_ITEM', product, qty });
            return true;
        },
        addLine: (item, qty = 1) => {
            const line = state.items.find((current) => current.productId === item.productId);
            if (item.stock < 1 ||
                qty < 1 ||
                qty > item.stock ||
                (line && line.quantity + qty > item.stock))
                return false;
            dispatch({ type: 'ADD_LINE', item, qty });
            return true;
        },
        setQuantity: (id, qty) => dispatch({ type: 'SET_QTY', productId: id, qty }),
        remove: (id) => dispatch({ type: 'REMOVE_ITEM', productId: id }),
        applyPromo: (code) => {
            if (code.trim().toUpperCase() !== '10X10')
                return false;
            dispatch({ type: 'APPLY_PROMO', code: '10X10' });
            return true;
        },
        removePromo: () => dispatch({ type: 'REMOVE_PROMO' }),
        clear: () => dispatch({ type: 'CLEAR' })
    }), [cart, state]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
    const value = useContext(CartContext);
    if (!value)
        throw new Error('useCart must be used inside CartProvider.');
    return value;
}
