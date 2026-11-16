import { createContext, useContext } from 'react';
export const USER_STORAGE_KEY = '10x_shop_user';
export const AuthContext = createContext(undefined);
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
