import { createContext, useContext } from "react";
// null: Provider-ის გარეთ Context ცარიელია
export const CartContext = createContext(null);
// საკუთარი hook: ყველგან useContext(CartContext)-ის და null-ის შემოწმების ნაცვლად
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside <CartProvider>");
    }
    return context;
}
