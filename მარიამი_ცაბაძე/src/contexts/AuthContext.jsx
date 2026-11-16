import { createContext, useContext, useState } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storage';
import { AUTH_SESSION_VERSION, loadUser } from '../services/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser);
    const createUser = (username, profile) => {
        const cleanUsername = username.trim();
        if (!cleanUsername)
            return null;
        const stableId = [...cleanUsername].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % 1_000_000, 1001);
        return {
            id: stableId,
            username: cleanUsername,
            isLoggedIn: true,
            firstName: profile?.firstName ?? cleanUsername,
            lastName: profile?.lastName ?? 'Shopper',
            email: profile?.email ?? `${cleanUsername.toLowerCase()}@10xshop.local`,
            phone: ''
        };
    };
    const saveUser = (next) => {
        setUser(next);
        StorageService.set(STORAGE_KEYS.user, {
            ...next,
            authSessionVersion: AUTH_SESSION_VERSION
        });
    };
    const login = async (username, password) => {
        const cleanUsername = username.trim();
        if (!cleanUsername || password.length < 6)
            return 'invalid-credentials';
        const nextUser = createUser(cleanUsername);
        if (!nextUser)
            return 'unavailable';
        saveUser(nextUser);
        return 'success';
    };
    const register = async (username, password, profile) => {
        const cleanUsername = username.trim();
        const cleanEmail = profile.email.trim().toLowerCase();
        if (!cleanUsername || password.length < 6)
            return 'unavailable';
        const next = createUser(cleanUsername, {
            ...profile,
            email: cleanEmail
        });
        if (!next)
            return 'unavailable';
        saveUser(next);
        return 'success';
    };
    const resetPassword = async (email, password) => {
        if (!email.trim() || password.length < 6)
            return 'unavailable';
        return 'success';
    };
    const logout = () => {
        setUser(null);
        StorageService.remove(STORAGE_KEYS.user);
    };
    const updateProfile = (profile) => {
        if (!user)
            return;
        const next = { ...user, ...profile };
        saveUser(next);
    };
    const clearLocalData = () => {
        StorageService.remove(STORAGE_KEYS.cart);
        StorageService.remove(STORAGE_KEYS.orders);
        StorageService.remove(STORAGE_KEYS.reviews);
    };
    return (<AuthContext.Provider value={{
            user,
            login,
            register,
            resetPassword,
            logout,
            updateProfile,
            clearLocalData
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error('useAuth must be used inside AuthProvider.');
    return value;
}
