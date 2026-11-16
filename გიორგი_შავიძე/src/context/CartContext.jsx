import { createContext, useContext, useState, useEffect, } from "react";
import { discountedPrice } from "../utils/format";
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem("shop_cart");
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem("shop_cart", JSON.stringify(items));
    }, [items]);
    const addToCart = (product, quantityToAdd = 1) => {
        const existingItem = items.find((item) => item.product.id === product.id);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const targetQty = currentQtyInCart + quantityToAdd;
        // 🛑 მარაგის შემოწმება: თუ კალათაში ჯამური რაოდენობა აჭარბებს არსებულ მარაგს
        if (targetQty > product.stock) {
            alert(`Insufficient stock! Only ${product.stock} items left in stock (you already have ${currentQtyInCart} in cart).`);
            return false;
        }
        if (existingItem) {
            setItems(items.map((item) => item.product.id === product.id
                ? { ...item, quantity: targetQty }
                : item));
        }
        else {
            setItems([...items, { product, quantity: quantityToAdd }]);
        }
        return true;
    };
    const updateQuantity = (productId, newQuantity) => {
        const item = items.find((i) => i.product.id === productId);
        if (!item)
            return;
        // 🛑 მარაგის შემოწმება რაოდენობის შეცვლისას
        if (newQuantity > item.product.stock) {
            alert(`Insufficient stock! Only ${item.product.stock} items left in stock.`);
            return;
        }
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(items.map((i) => i.product.id === productId ? { ...i, quantity: newQuantity } : i));
    };
    const removeFromCart = (productId) => {
        setItems(items.filter((item) => item.product.id !== productId));
    };
    const clearCart = () => {
        setItems([]);
    };
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        const price = discountedPrice(item.product.price, item.product.discountPercentage);
        return sum + price * item.quantity;
    }, 0);
    return (<CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
        }}>
      {children}
    </CartContext.Provider>);
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context)
        throw new Error("useCart must be used within CartProvider");
    return context;
};
