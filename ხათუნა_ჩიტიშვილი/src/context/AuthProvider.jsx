import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks";
import { STORAGE_KEYS } from "@/utils";
import { AuthContext } from "./AuthContext";
/**
 * Authentication Provider component.
 * Manages user authentication state, synchronizes with localStorage via useLocalStorage,
 * and provides login / logout methods throughout the application tree.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useLocalStorage(STORAGE_KEYS.USER, null);
    const login = useCallback((username) => {
        setUser({
            username: username.trim(),
            isLoggedIn: true,
        });
    }, [setUser]);
    const logout = useCallback(() => {
        setUser(null);
    }, [setUser]);
    const value = useMemo(() => ({
        user,
        isLoggedIn: Boolean(user && user.isLoggedIn),
        login,
        logout,
    }), [user, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
