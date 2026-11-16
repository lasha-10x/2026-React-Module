import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { userStorage } from "../models/storage";
const AuthContext = createContext(null);
function createUser(username, email) {
    return { username, firstName: "", lastName: "", email, phone: "" };
}
export function AuthProvider({ children }) {
    // Optional persistence (shop_user) so a page refresh keeps the session.
    const [user, setUser] = useState(() => userStorage.get());
    useEffect(() => {
        if (user)
            userStorage.set(user);
        else
            userStorage.remove();
    }, [user]);
    const login = useCallback((username, email) => {
        const name = username.trim();
        const mail = email.trim();
        // Same username again → keep the saved profile, just update the email.
        setUser((current) => (current?.username === name ? { ...current, email: mail } : createUser(name, mail)));
    }, []);
    const logout = useCallback(() => setUser(null), []);
    const updateProfile = useCallback((values) => {
        setUser((current) => current
            ? {
                ...current,
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
            }
            : current);
    }, []);
    const value = useMemo(() => {
        const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
        return {
            user,
            isLoggedIn: user !== null,
            displayName: fullName || user?.username || "Guest",
            login,
            logout,
            updateProfile,
        };
    }, [user, login, logout, updateProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside <AuthProvider>");
    return context;
}
