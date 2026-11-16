import { createContext } from "react";
import { STORAGE_KEYS, getFromLocalStorage } from "@/utils";
export const CartContext = createContext(null);
export function initCartState() {
    const raw = getFromLocalStorage(STORAGE_KEYS.CART, {
        items: [],
        promoCode: null,
    });
    if (Array.isArray(raw)) {
        return { items: raw, promoCode: null };
    }
    return {
        items: Array.isArray(raw?.items) ? raw.items : [],
        promoCode: raw?.promoCode ?? null,
    };
}
export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            if (action.product.stock <= 0) {
                return state;
            }
            const qty = action.qty && action.qty > 0 ? action.qty : 1;
            const existingIndex = state.items.findIndex((item) => item.productId === action.product.id);
            if (existingIndex > -1) {
                const existing = state.items[existingIndex];
                if (existing.quantity >= existing.stock) {
                    return state;
                }
                const newQty = Math.min(existing.quantity + qty, existing.stock);
                const updated = [...state.items];
                updated[existingIndex] = { ...existing, quantity: newQty };
                return { ...state, items: updated };
            }
            const newItem = {
                productId: action.product.id,
                title: action.product.title,
                thumbnail: action.product.thumbnail,
                price: action.product.price,
                discountPercentage: action.product.discountPercentage,
                stock: action.product.stock,
                quantity: Math.min(qty, action.product.stock),
            };
            return { ...state, items: [...state.items, newItem] };
        }
        case "SET_QTY": {
            const updated = state.items.map((item) => {
                if (item.productId === action.productId) {
                    const boundedQty = Math.max(1, Math.min(action.qty, item.stock));
                    return { ...item, quantity: boundedQty };
                }
                return item;
            });
            return { ...state, items: updated };
        }
        case "REMOVE_ITEM": {
            return {
                ...state,
                items: state.items.filter((item) => item.productId !== action.productId),
            };
        }
        case "CLEAR": {
            return { items: [], promoCode: null };
        }
        case "APPLY_PROMO": {
            return { ...state, promoCode: action.code.trim().toUpperCase() };
        }
        case "REMOVE_PROMO": {
            return { ...state, promoCode: null };
        }
        default: {
            const _exhaustiveCheck = action;
            void _exhaustiveCheck;
            return state;
        }
    }
}
