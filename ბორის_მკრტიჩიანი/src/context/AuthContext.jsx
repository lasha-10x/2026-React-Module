import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS, StorageService } from "../models/StorageService";
const AuthContext = createContext(undefined);
function isAuthUser(val) {
    if (typeof val !== "object" || val === null)
        return false;
    const u = val;
    return typeof u.username === "string" && typeof u.isLoggedIn === "boolean";
}
const userStorage = new StorageService(STORAGE_KEYS.user, isAuthUser);
const themeStorage = new StorageService(STORAGE_KEYS.theme, (val) => val === "light" || val === "dark");
const getInitialAuth = () => {
    const saved = userStorage.get();
    if (saved && saved.isLoggedIn) {
        return saved;
    }
    return { username: "", isLoggedIn: false };
};
const getInitialTheme = () => {
    return themeStorage.get() ?? "light";
};
export function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialAuth);
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        if (user.isLoggedIn) {
            userStorage.set(user);
        }
        else {
            userStorage.remove();
        }
    }, [user]);
    useEffect(() => {
        themeStorage.set(theme);
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
        if (theme === "dark") {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
    }, [theme]);
    const login = (username) => {
        const clean = username.trim();
        setUser({
            username: clean,
            isLoggedIn: true,
            firstName: clean.split(" ")[0] || clean,
            lastName: clean.split(" ").slice(1).join(" "),
            email: `${clean.replace(/\s+/g, ".").toLowerCase()}@example.com`,
            phone: "",
        });
    };
    const logout = () => {
        setUser({
            username: "",
            isLoggedIn: false,
        });
        userStorage.remove();
    };
    const updateProfile = (profile) => {
        setUser((prev) => ({
            ...prev,
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim(),
        }));
    };
    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };
    return (<AuthContext.Provider value={{ user, login, logout, updateProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
