/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, } from "react";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [username, setUsername] = useState(null);
    const login = (value) => {
        setUsername(value);
    };
    const logout = () => {
        setUsername(null);
    };
    const value = {
        username,
        isAuthenticated: username !== null,
        login,
        logout,
    };
    return (<AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
