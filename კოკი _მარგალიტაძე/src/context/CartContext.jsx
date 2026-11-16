import { createContext, useState } from 'react';
import { isValidPromo, PROMO_CODE } from '../utils/price';
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext({
    items: [],
    totalQuantity: 0,
    promoCode: null,
    addItem: () => { },
    removeItem: () => { },
    setQuantity: () => { },
    clearCart: () => { },
    applyPromo: () => false,
    removePromo: () => { },
});
export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [promoCode, setPromoCode] = useState(null);
    const addItem = (product, quantity) => {
        setItems((current) => {
            const existing = current.find((item) => item.id === product.id);
            if (existing) {
                return current.map((item) => item.id === product.id
                    ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                    : item);
            }
            return [
                ...current,
                {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    thumbnail: product.thumbnail,
                    stock: product.stock,
                    quantity,
                },
            ];
        });
    };
    const removeItem = (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };
    const setQuantity = (id, quantity) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity } : item)));
    };
    const clearCart = () => {
        setItems([]);
        setPromoCode(null);
    };
    const applyPromo = (code) => {
        if (!isValidPromo(code))
            return false;
        setPromoCode(PROMO_CODE);
        return true;
    };
    const removePromo = () => setPromoCode(null);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return (<CartContext.Provider value={{
            items,
            totalQuantity,
            promoCode,
            addItem,
            removeItem,
            setQuantity,
            clearCart,
            applyPromo,
            removePromo,
        }}>
      {children}
    </CartContext.Provider>);
}
