import { useEffect, useState } from "react";
import { CartContext } from "./cartContext";
const STORAGE_KEY = "shop_cart";
// localStorage-დან წაკითხვა. JSON-ს ტიპი არ აქვს, ამიტომ ვამოწმებთ, რომ items მასივია
function loadItems() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" &&
            parsed !== null &&
            "items" in parsed &&
            Array.isArray(parsed.items)) {
            return parsed.items;
        }
        return [];
    }
    catch {
        return []; // დაზიანებული JSON → ცარიელი კალათა, აპი არ ტყდება
    }
}
export default function CartProvider({ children }) {
    // lazy init: loadItems-ს ვაწვდით ფუნქციად (ფრჩხილების გარეშე),
    // ამიტომ localStorage მხოლოდ პირველ render-ზე იკითხება
    const [items, setItems] = useState(loadItems);
    // კალათა შეიცვალა → localStorage-ში ვინახავთ (refresh-ის შემდეგაც დარჩება)
    useEffect(() => {
        const state = { items };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [items]);
    // badge-ისთვის: ყველა რაოდენობის ჯამი (არა ხაზების რაოდენობა)
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    function addItem(product, qty) {
        const existing = items.find((item) => item.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        // მარაგზე მეტს არ ვამატებთ
        if (qty < 1 || currentQty + qty > product.stock)
            return false;
        if (existing) {
            // უკვე არის → map-ით ახალ მასივს ვქმნით, ერთ ხაზს ახალი ობიექტით ვცვლით
            setItems(items.map((item) => item.productId === product.id
                ? { ...item, quantity: item.quantity + qty }
                : item));
        }
        else {
            // ახალია → Product-იდან მხოლოდ საჭირო ველებს ვიღებთ
            const newItem = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: qty,
            };
            setItems([...items, newItem]);
        }
        return true;
    }
    function setQuantity(productId, qty) {
        setItems(items.map((item) => 
        // რაოდენობა 1-სა და stock-ს შორის რჩება
        item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(qty, 1), item.stock) }
            : item));
    }
    function removeItem(productId) {
        setItems(items.filter((item) => item.productId !== productId));
    }
    function clearCart() {
        setItems([]);
    }
    return (
    // React 19: Context თვითონ არის Provider (ძველი ჩანაწერი: <CartContext.Provider>)
    <CartContext value={{ items, totalCount, addItem, setQuantity, removeItem, clearCart }}>
      {children}
    </CartContext>);
}
