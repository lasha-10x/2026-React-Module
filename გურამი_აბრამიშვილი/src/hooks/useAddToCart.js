import { useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
// One place that adds to the cart AND tells the user what happened.
export function useAddToCart() {
    const { addItem } = useCart();
    const { toast } = useToast();
    return useCallback((product, qty = 1) => {
        const result = addItem(product, qty);
        if (result.ok)
            toast("Added to cart ✓");
        else
            toast(result.message, "error");
        return result;
    }, [addItem, toast]);
}
