import { createContext, useContext, useState } from "react";
import { userStorage } from "../models/StorageService.js";
const defaultUser = {
    username: "",
    isLoggedIn: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
};
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = userStorage.get();
        if (saved && saved.isLoggedIn) {
            return saved;
        }
        return defaultUser;
    });
    const login = (username, additional) => {
        const newUser = {
            username: username.trim(),
            isLoggedIn: true,
            firstName: additional?.firstName || username.trim(),
            lastName: additional?.lastName || "Member",
            email: additional?.email || `${username.trim().toLowerCase()}@example.com`,
            phone: additional?.phone || "+1 555-0199",
        };
        setUser(newUser);
        userStorage.set(newUser);
    };
    const logout = () => {
        setUser(defaultUser);
        userStorage.remove();
    };
    const updateProfile = (profile) => {
        setUser((prev) => {
            const updated = { ...prev, ...profile };
            userStorage.set(updated);
            return updated;
        });
    };
    return (<AuthContext.Provider value={{
            user,
            isLoggedIn: user.isLoggedIn,
            login,
            logout,
            updateProfile,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
