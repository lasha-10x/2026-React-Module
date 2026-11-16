import { createContext, useContext, useState } from 'react';
const GUEST = { username: '', isLoggedIn: false };
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(GUEST);
    function login(username) {
        setUser({ username, isLoggedIn: true });
    }
    function logout() {
        // Only the login state is reset — the cart is NOT touched (P0.3).
        setUser(GUEST);
    }
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
/** Read the auth state anywhere below <AuthProvider>. */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return context;
}
