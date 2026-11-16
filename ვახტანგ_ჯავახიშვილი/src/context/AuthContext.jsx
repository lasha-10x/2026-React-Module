import { createContext, useContext, useState } from "react";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("activeUser");
        return saved ? JSON.parse(saved) : null;
    });
    const register = (name, email, pass) => {
        const userData = { name, email, pass };
        localStorage.setItem(`user_${email}`, JSON.stringify(userData));
        localStorage.setItem("activeUser", JSON.stringify({ name, email }));
        setUser({ name, email });
    };
    const login = (email, pass) => {
        const stored = localStorage.getItem(`user_${email}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.pass === pass) {
                const active = { name: parsed.name, email: parsed.email };
                localStorage.setItem("activeUser", JSON.stringify(active));
                setUser(active);
                return true;
            }
        }
        return false;
    };
    const logout = () => {
        localStorage.removeItem("activeUser");
        localStorage.removeItem("shop_cart"); // cleac cart whlie logout
        localStorage.removeItem("shop_promo"); // clear promo code
        setUser(null);
    };
    return (<AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
}
