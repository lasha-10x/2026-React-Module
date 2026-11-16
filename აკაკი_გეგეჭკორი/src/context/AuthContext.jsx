import { createContext, useContext, useState, useEffect, } from "react";
import { userStorage } from "../models/userStorage";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => userStorage.get());
    useEffect(() => {
        if (user) {
            userStorage.set(user);
        }
        else {
            userStorage.remove();
        }
    }, [user]);
    const login = (username) => {
        setUser({ username, isLoggedIn: true });
    };
    const logout = () => {
        setUser(null);
    };
    const updateProfile = (values) => {
        setUser((prev) => {
            if (!prev) {
                return null;
            }
            return {
                ...prev,
                ...values,
            };
        });
    };
    return (<AuthContext.Provider value={{ user, login, logout, updateProfile }}>
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
