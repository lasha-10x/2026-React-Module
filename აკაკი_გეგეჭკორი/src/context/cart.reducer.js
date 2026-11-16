const clamp = (qty, stock) => Math.max(1, Math.min(qty, stock));
export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const { product, qty } = action;
            if (product.stock <= 0 || qty <= 0) {
                return state;
            }
            const existing = state.items.find((i) => i.productId === product.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) => i.productId === product.id
                        ? { ...i, quantity: clamp(i.quantity + qty, product.stock) }
                        : i),
                };
            }
            const item = {
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                price: product.price,
                discountPercentage: product.discountPercentage,
                stock: product.stock,
                quantity: clamp(qty, product.stock),
            };
            return { ...state, items: [...state.items, item] };
        }
        case "SET_QTY":
            return {
                ...state,
                items: state.items.map((i) => i.productId === action.productId
                    ? { ...i, quantity: clamp(action.qty, i.stock) }
                    : i),
            };
        case "REMOVE_ITEM":
            return {
                ...state,
                items: state.items.filter((i) => i.productId !== action.productId),
            };
        case "CLEAR":
            return { items: [], promoCode: null };
        case "APPLY_PROMO":
            return { ...state, promoCode: action.code.trim().toUpperCase() };
        case "REMOVE_PROMO":
            return { ...state, promoCode: null };
        default: {
            const _exhaustive = action;
            void _exhaustive;
            return state;
        }
    }
}
