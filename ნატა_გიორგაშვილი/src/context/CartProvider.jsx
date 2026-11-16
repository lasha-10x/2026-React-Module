import { useEffect, useState } from 'react';
import { CartContext } from './cart-context';
import { Cart } from '../models/Cart';
import { cartStorage } from '../models/storage';
export default function CartProvider({ children }) {
    const [items, setItems] = useState(() => cartStorage.get()?.items ?? []);
    const [promoCode, setPromoCode] = useState(() => cartStorage.get()?.promoCode ?? null);
    // Persist after every change (the storage service is the only door to localStorage).
    useEffect(() => {
        cartStorage.set({ items, promoCode });
    }, [items, promoCode]);
    function addItem(product, quantity) {
        if (product.stock === 0) {
            return { ok: false, message: 'This product is out of stock.' };
        }
        const existing = items.find((item) => item.productId === product.id);
        const inCart = existing?.quantity ?? 0;
        if (inCart + quantity > product.stock) {
            return {
                ok: false,
                message: `Only ${product.stock} in stock. You already have ${inCart} in your cart.`,
            };
        }
        if (existing) {
            setItems(items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
        }
        else {
            setItems([
                ...items,
                {
                    productId: product.id,
                    title: product.title,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    stock: product.stock,
                    quantity,
                },
            ]);
        }
        return { ok: true, message: `Added ${quantity} × ${product.title} to the cart.` };
    }
    function setQuantity(productId, quantity) {
        setItems((current) => current.map((item) => item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
            : item));
    }
    function removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
    }
    function clearCart() {
        setItems([]);
        setPromoCode(null);
    }
    function applyPromo(code) {
        if (!Cart.isValidPromo(code)) {
            return { ok: false, message: 'Invalid promo code' };
        }
        setPromoCode(Cart.PROMO_CODE);
        return { ok: true, message: 'Promo code applied' };
    }
    function removePromo() {
        setPromoCode(null);
    }
    const cart = new Cart(items, promoCode);
    const value = {
        cart,
        items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal(),
        discount: cart.discount(),
        total: cart.total(),
        promoCode,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        applyPromo,
        removePromo,
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
