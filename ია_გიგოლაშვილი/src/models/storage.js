import { isAuthUser, isCartState, isOrderList, isReviewMap, isTheme } from "../utils/guards";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { StorageService } from "./StorageService";
export const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
export const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderList);
export const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, isReviewMap);
export const themeStorage = new StorageService(STORAGE_KEYS.theme, isTheme);
export const userStorage = new StorageService(STORAGE_KEYS.user, isAuthUser);
/** Newest first. */
export function loadOrders() {
    const orders = ordersStorage.get() ?? [];
    return [...orders].sort((a, b) => b.id - a.id);
}
export function saveOrder(order) {
    ordersStorage.set([...(ordersStorage.get() ?? []), order]);
}
