import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { Cart } from "../models/Cart";
import { cartStorage } from "../utils/storage";
import { useToast } from "../hooks/useToast";
import { PROMO_CODE } from "../utils/cartRules";
const EMPTY_CART = { items: [], promoCode: null };
function CartProvider({ children }) {
    const [cart, setCart] = useState(() => cartStorage.get() ?? EMPTY_CART);
    const { showToast } = useToast();
    // ყოველი ცვლილებისას კალათას ვინახავთ
    useEffect(() => {
        cartStorage.set(cart);
    }, [cart]);
    // მხოლოდ items-ის შეცვლა, promoCode უცვლელი რჩება
    function updateItems(update) {
        setCart((prev) => ({ ...prev, items: update(prev.items) }));
    }
    function addItem(product, quantity) {
        const inCart = cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;
        if (inCart >= product.stock) {
            showToast("No more items in stock", "error");
            return;
        }
        updateItems((items) => {
            const existing = items.find((item) => item.productId === product.id);
            if (existing) {
                const newQuantity = Math.min(existing.quantity + quantity, product.stock);
                return items.map((item) => item.productId === product.id ? { ...item, quantity: newQuantity } : item);
            }
            const newItem = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: Math.min(quantity, product.stock),
            };
            return [...items, newItem];
        });
        showToast(`${product.title} added to cart ✓`);
    }
    // რამდენიმე ნივთის ერთად დამატება (Reorder)
    function addItems(newItems) {
        updateItems((items) => {
            let result = items;
            for (const newItem of newItems) {
                const existing = result.find((item) => item.productId === newItem.productId);
                result = existing
                    ? result.map((item) => item.productId === newItem.productId
                        ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.stock) }
                        : item)
                    : [...result, { ...newItem, quantity: Math.min(newItem.quantity, newItem.stock) }];
            }
            return result;
        });
        showToast("Items added to cart ✓");
    }
    function removeItem(productId) {
        updateItems((items) => items.filter((item) => item.productId !== productId));
    }
    function setQuantity(productId, quantity) {
        updateItems((items) => items.map((item) => item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
            : item));
    }
    function clearCart() {
        setCart(EMPTY_CART);
    }
    function applyPromo(code) {
        if (code.trim().toUpperCase() !== PROMO_CODE) {
            return false;
        }
        setCart((prev) => ({ ...prev, promoCode: PROMO_CODE }));
        return true;
    }
    function removePromo() {
        setCart((prev) => ({ ...prev, promoCode: null }));
    }
    // ყველა გამოთვლა Cart კლასშია
    const model = new Cart(cart.items, cart.promoCode);
    const value = {
        items: cart.items,
        promoCode: cart.promoCode,
        totalQuantity: model.itemCount,
        subtotal: model.subtotal(),
        discount: model.discount(),
        shipping: model.shipping(),
        total: model.total(),
        addItem,
        addItems,
        removeItem,
        setQuantity,
        clearCart,
        applyPromo,
        removePromo,
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export default CartProvider;
