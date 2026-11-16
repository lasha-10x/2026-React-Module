import { assertNever } from "@/utils/guards";
/** Keeps a quantity between 1 and the stock. */
function clampQuantity(quantity, stock) {
    return Math.min(Math.max(1, quantity), stock);
}
/** Builds a new cart line from a product. */
function newLine(product, qty) {
    return {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity: qty,
    };
}
/**
 * Every case returns a new object and never changes the old one. React compares by reference, so changing
 * the old state in place would look like no change at all, and nothing would redraw.
 */
export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find((item) => item.productId === action.product.id);
            const nextQuantity = (existing?.quantity ?? 0) + action.qty;
            // PRD P4.2: over the stock, the state doesn't change, and the caller shows the toast.
            if (nextQuantity > action.product.stock) {
                return state;
            }
            if (existing) {
                return {
                    ...state,
                    // The stock is refreshed from the product, because the saved number may be out of date.
                    items: state.items.map((item) => item.productId === action.product.id ? { ...item, stock: action.product.stock, quantity: nextQuantity } : item),
                };
            }
            return { ...state, items: [...state.items, newLine(action.product, action.qty)] };
        }
        case "SET_QTY":
            return {
                ...state,
                items: state.items.map((item) => item.productId === action.productId ? { ...item, quantity: clampQuantity(action.qty, item.stock) } : item),
            };
        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((item) => item.productId !== action.productId) };
        case "CLEAR":
            return { items: [], promoCode: null };
        case "APPLY_PROMO":
            return { ...state, promoCode: action.code };
        case "REMOVE_PROMO":
            return { ...state, promoCode: null };
        case "REPLACE":
            return action.state;
        default:
            // If a new action is added to the union but not handled above, `action` isn't `never` here, and this
            // line stops compiling. The compiler checks that every case is covered.
            return assertNever(action);
    }
}
