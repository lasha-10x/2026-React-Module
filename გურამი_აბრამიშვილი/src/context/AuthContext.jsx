import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isAuthUser } from "@/utils/guards";
import { STORAGE_KEYS } from "@/utils/constants";
const AuthContext = createContext(null);
function isStoredUser(x) {
    return x === null || isAuthUser(x);
}
// Login is a local simulation: no real credentials are checked, stored or sent anywhere.
export function AuthProvider({ children }) {
    const [user, setUser] = useLocalStorage(STORAGE_KEYS.user, null, isStoredUser);
    // Set synchronously by logout(), cleared as soon as the next navigation has happened.
    // ProtectedRoute uses it to tell "the user just logged out" (the logout handler is already sending
    // them to the catalog) apart from "a guest opened a protected page" (send them to /login).
    const loggingOut = useRef(false);
    const location = useLocation();
    useEffect(() => {
        loggingOut.current = false;
    }, [location.key]);
    const login = useCallback((username) => {
        loggingOut.current = false;
        setUser({ username, isLoggedIn: true, firstName: "", lastName: "", email: "", phone: "" });
    }, [setUser]);
    const logout = useCallback(() => {
        loggingOut.current = true;
        setUser(null);
    }, [setUser]);
    const isLoggingOut = useCallback(() => loggingOut.current, []);
    const updateProfile = useCallback((profile) => {
        setUser((prev) => (prev === null ? prev : { ...prev, ...profile }));
    }, [setUser]);
    const value = useMemo(() => ({ user, isLoggedIn: user?.isLoggedIn === true, login, logout, isLoggingOut, updateProfile }), [user, login, logout, isLoggingOut, updateProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null)
        throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
