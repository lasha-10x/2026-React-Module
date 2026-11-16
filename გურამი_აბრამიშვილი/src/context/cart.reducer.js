import { PROMO_CODE } from "@/utils/constants";
export const emptyCart = { items: [], promoCode: null };
function toCartItem(product, quantity) {
    return {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity,
    };
}
// A pure function: no localStorage, no side effects. Every branch returns a NEW object (immutable updates).
export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const { product, qty } = action;
            if (!Number.isInteger(qty) || qty < 1)
                return state;
            const existing = state.items.find((item) => item.productId === product.id);
            const nextQty = (existing?.quantity ?? 0) + qty;
            if (nextQty > product.stock)
                return state; // never exceed the stock
            if (existing === undefined) {
                return { ...state, items: [...state.items, toCartItem(product, nextQty)] };
            }
            return {
                ...state,
                items: state.items.map((item) => item.productId === product.id ? { ...item, quantity: nextQty, stock: product.stock } : item),
            };
        }
        case "SET_QTY": {
            return {
                ...state,
                items: state.items.map((item) => {
                    if (item.productId !== action.productId)
                        return item;
                    const clamped = Math.min(Math.max(Math.trunc(action.qty), 1), Math.max(item.stock, 1));
                    return { ...item, quantity: clamped };
                }),
            };
        }
        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((item) => item.productId !== action.productId) };
        case "CLEAR":
            return { items: [], promoCode: null };
        case "APPLY_PROMO": {
            const code = action.code.trim().toUpperCase();
            return code === PROMO_CODE ? { ...state, promoCode: code } : state;
        }
        case "REMOVE_PROMO":
            return { ...state, promoCode: null };
        case "SET_DELIVERY":
            return state.deliveryMethod === action.method ? state : { ...state, deliveryMethod: action.method };
        default: {
            const _exhaustive = action; // compile error if a new action type is not handled
            return _exhaustive;
        }
    }
}
