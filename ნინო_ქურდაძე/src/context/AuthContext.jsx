import { createContext, useContext, useState } from "react";
import { storageGetJSON, storageRemove, storageSet } from "@/utils/storage";
const AuthContext = createContext(undefined);
const USER_STORAGE_KEY = "shop_user";
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = storageGetJSON(USER_STORAGE_KEY, null);
        return saved && typeof saved.username === "string" && saved.username.trim()
            ? {
                username: saved.username.trim(),
                firstName: typeof saved.firstName === "string" ? saved.firstName : undefined,
                lastName: typeof saved.lastName === "string" ? saved.lastName : undefined,
                email: typeof saved.email === "string" ? saved.email : undefined,
            }
            : null;
    });
    const login = (username) => {
        const newUser = {
            username: username.trim(),
        };
        setUser(newUser);
        storageSet(USER_STORAGE_KEY, JSON.stringify(newUser));
    };
    const register = (data) => {
        const newUser = {
            username: data.username.trim(),
            email: data.email?.trim(),
            firstName: data.firstName?.trim(),
            lastName: data.lastName?.trim(),
        };
        setUser(newUser);
        storageSet(USER_STORAGE_KEY, JSON.stringify(newUser));
    };
    const logout = () => {
        setUser(null);
        storageRemove(USER_STORAGE_KEY);
    };
    const updateUser = (data) => {
        setUser((prev) => {
            if (!prev)
                return null;
            const updated = {
                ...prev,
                ...data,
            };
            storageSet(USER_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };
    return (<AuthContext.Provider value={{
            user,
            isLoggedIn: user !== null,
            login,
            signIn: login,
            register,
            signUp: register,
            logout,
            signOut: logout,
            updateUser,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
