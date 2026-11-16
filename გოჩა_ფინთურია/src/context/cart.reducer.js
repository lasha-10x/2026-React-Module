export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const { product, qty } = action;
            if (qty <= 0 || product.stock <= 0)
                return state;
            const existingIndex = state.items.findIndex((item) => item.productId === product.id);
            if (existingIndex > -1) {
                const currentItem = state.items[existingIndex];
                const newQty = currentItem.quantity + qty;
                if (newQty > product.stock) {
                    return state; // cannot exceed stock
                }
                const newItems = [...state.items];
                newItems[existingIndex] = {
                    ...currentItem,
                    quantity: newQty,
                };
                return { ...state, items: newItems };
            }
            const initialQty = Math.min(qty, product.stock);
            const newItem = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: initialQty,
            };
            return {
                ...state,
                items: [...state.items, newItem],
            };
        }
        case "SET_QTY": {
            const { productId, qty } = action;
            if (qty < 1)
                return state;
            const item = state.items.find((i) => i.productId === productId);
            if (!item)
                return state;
            const safeQty = Math.min(qty, item.stock);
            const newItems = state.items.map((i) => i.productId === productId ? { ...i, quantity: safeQty } : i);
            return { ...state, items: newItems };
        }
        case "REMOVE_ITEM": {
            return {
                ...state,
                items: state.items.filter((i) => i.productId !== action.productId),
            };
        }
        case "CLEAR": {
            return {
                items: [],
                promoCode: null,
            };
        }
        case "APPLY_PROMO": {
            return {
                ...state,
                promoCode: action.code,
            };
        }
        case "REMOVE_PROMO": {
            return {
                ...state,
                promoCode: null,
            };
        }
        default: {
            const _exhaustive = action;
            return _exhaustive;
        }
    }
}
