import { createContext, useContext, useState, } from "react";
//shared context for authentication state and functions
const AuthContext = createContext(undefined);
//provides authentication state and functions to its children
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    function login(username) {
        setUser(username);
    }
    function logout() {
        setUser(null);
    }
    return (<AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
//custom hook to access authentication context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}
