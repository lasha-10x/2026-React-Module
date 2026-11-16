import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import { userStorage } from '../models/storage';
const GUEST = { username: '', isLoggedIn: false };
const AuthContext = createContext(null);
/**
 * A local login simulation: there is no server and no password check.
 * Only the username (and optional profile fields) is remembered, never the password.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => userStorage.get() ?? GUEST);
    useEffect(() => {
        if (user.isLoggedIn)
            userStorage.set(user);
        else
            userStorage.remove();
    }, [user]);
    const login = useCallback((username) => {
        setUser({ username, isLoggedIn: true });
    }, []);
    const logout = useCallback(() => setUser(GUEST), []);
    const updateProfile = useCallback((changes) => {
        setUser((previous) => ({ ...previous, ...changes }));
    }, []);
    const value = useMemo(() => ({ user, isLoggedIn: user.isLoggedIn, login, logout, updateProfile }), [user, login, logout, updateProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used inside <AuthProvider>');
    return context;
}
