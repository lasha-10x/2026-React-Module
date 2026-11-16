import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { cartStorage, orderStorage, profileStorage, userStorage } from '../utils/storage';
import { Cart } from '../models/Cart';
import { OrderModel } from '../models/Order';
import { PROMO_CODE } from '../utils/constants';
function readInitialCart() {
    const stored = cartStorage.get();
    if (!stored || !Array.isArray(stored.items))
        return { items: [], promoCode: null };
    return { items: stored.items, promoCode: typeof stored.promoCode === 'string' ? stored.promoCode : null };
}
const initialCart = readInitialCart();
function cartReducer(state, action) { switch (action.type) {
    case 'ADD_ITEM': {
        const current = state.items.find(x => x.product.id === action.product.id);
        const quantity = Math.min(action.product.stock, (current?.quantity ?? 0) + (action.quantity ?? 1));
        return { ...state, items: current ? state.items.map(x => x.product.id === action.product.id ? { ...x, quantity } : x) : [...state.items, { product: action.product, quantity }] };
    }
    case 'SET_QUANTITY': return { ...state, items: state.items.map(x => x.product.id === action.id ? { ...x, quantity: Math.max(1, Math.min(x.product.stock, action.quantity)) } : x) };
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter(x => x.product.id !== action.id) };
    case 'SET_PROMO': return { ...state, promoCode: action.code };
    case 'CLEAR': return { items: [], promoCode: null };
    default: return state;
} }
const CartContext = createContext(undefined);
export function CartProvider({ children }) { const [state, dispatch] = useReducer(cartReducer, initialCart); useEffect(() => cartStorage.set(state), [state]); const value = useMemo(() => ({ state, add: (product, quantity) => dispatch({ type: 'ADD_ITEM', product, quantity }), setQuantity: (id, quantity) => dispatch({ type: 'SET_QUANTITY', id, quantity }), remove: id => dispatch({ type: 'REMOVE_ITEM', id }), applyPromo: code => { const valid = code.trim().toUpperCase() === PROMO_CODE; dispatch({ type: 'SET_PROMO', code: valid ? PROMO_CODE : null }); return valid; }, clear: () => dispatch({ type: 'CLEAR' }), count: state.items.reduce((sum, item) => sum + item.quantity, 0), cart: new Cart(state.items, state.promoCode) }), [state]); return <CartContext.Provider value={value}>{children}</CartContext.Provider>; }
export function useCart() { const value = useContext(CartContext); if (!value)
    throw new Error('useCart must be used inside CartProvider'); return value; }
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) { const [user, setUser] = useState(() => { const value = userStorage.get(); return value && typeof value.username === 'string' && typeof value.isLoggedIn === 'boolean' ? value : { username: '', isLoggedIn: false }; }); useEffect(() => userStorage.set(user), [user]); const value = { user, login: (username) => setUser({ username, isLoggedIn: true }), signup: (fullName, email) => setUser({ username: email.split('@')[0], fullName, email, isLoggedIn: true }), logout: () => setUser({ username: '', isLoggedIn: false }) }; return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const value = useContext(AuthContext); if (!value)
    throw new Error('useAuth must be used inside AuthProvider'); return value; }
const OrdersContext = createContext(undefined);
export function OrdersProvider({ children }) { const [orders, setOrders] = useState(orderStorage.get() ?? []); useEffect(() => orderStorage.set(orders), [orders]); const { state, cart, clear } = useCart(); const createOrder = (checkout) => { const order = OrderModel.create(state.items, checkout, cart.total()).data; setOrders(current => [order, ...current]); clear(); return order; }; return <OrdersContext.Provider value={{ orders, createOrder, clearOrders: () => setOrders([]) }}>{children}</OrdersContext.Provider>; }
export function useOrders() { const value = useContext(OrdersContext); if (!value)
    throw new Error('useOrders must be used inside OrdersProvider'); return value; }
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) { const [dark, setDark] = useState(() => localStorage.getItem('shop_theme') === 'dark'); useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('shop_theme', dark ? 'dark' : 'light'); }, [dark]); return <ThemeContext.Provider value={{ dark, toggle: () => setDark(value => !value) }}>{children}</ThemeContext.Provider>; }
export function useTheme() { const value = useContext(ThemeContext); if (!value)
    throw new Error('useTheme must be used inside ThemeProvider'); return value; }
export function clearLocalData() { cartStorage.remove(); orderStorage.remove(); profileStorage.remove(); }
