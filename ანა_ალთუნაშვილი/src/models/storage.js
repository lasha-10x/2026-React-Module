import { isCartState } from '../utils/guards/cart.guards';
import { isOrderList } from '../utils/guards/order.guards';
import { isReviewsMap } from '../utils/guards/review.guards';
import { isAuthUser, isTheme } from '../utils/guards/user.guards';
import { StorageService } from './StorageService';
/** The localStorage registry of the app. */
export const STORAGE_KEYS = {
    cart: 'shop_cart',
    user: 'shop_user',
    orders: 'shop_orders',
    reviews: 'shop_reviews',
    theme: 'shop_theme',
};
export const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
export const userStorage = new StorageService(STORAGE_KEYS.user, isAuthUser);
export const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderList);
export const reviewsStorage = new StorageService(STORAGE_KEYS.reviews, isReviewsMap);
export const themeStorage = new StorageService(STORAGE_KEYS.theme, isTheme);
