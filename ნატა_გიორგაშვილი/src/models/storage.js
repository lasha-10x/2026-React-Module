import { isCartState, isOrderDataArray } from '../utils/guards';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { StorageService } from './StorageService';
export const cartStorage = new StorageService(STORAGE_KEYS.cart, isCartState);
export const ordersStorage = new StorageService(STORAGE_KEYS.orders, isOrderDataArray);
