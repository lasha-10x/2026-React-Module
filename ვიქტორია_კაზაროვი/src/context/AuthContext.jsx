import { createContext, useContext, useEffect, useState } from 'react';
const AUTH_STORAGE_KEY = 'shop_auth_user';
function readSavedUser() {
    try {
        const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!saved)
            return null;
        const value = JSON.parse(saved);
        if (typeof value !== 'object' || value === null || Array.isArray(value) || !('username' in value)
            || typeof value.username !== 'string' || !value.username.trim())
            return null;
        const user = { username: value.username };
        if ('email' in value) {
            if (typeof value.email !== 'string')
                return null;
            user.email = value.email;
        }
        if ('firstName' in value) {
            if (typeof value.firstName !== 'string')
                return null;
            user.firstName = value.firstName;
        }
        if ('lastName' in value) {
            if (typeof value.lastName !== 'string')
                return null;
            user.lastName = value.lastName;
        }
        if ('phone' in value) {
            if (typeof value.phone !== 'string')
                return null;
            user.phone = value.phone;
        }
        return user;
    }
    catch {
        return null;
    }
}
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(readSavedUser);
    useEffect(() => {
        try {
            if (user)
                sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            else
                sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
        catch {
            // The current tab still works if browser storage is unavailable.
        }
    }, [user]);
    function login(username, email) {
        setUser(email ? { username, email } : { username });
    }
    function logout() {
        setUser(null);
    }
    function updateProfile(details) {
        setUser((current) => current ? { ...current, ...details } : null);
    }
    return (<AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
