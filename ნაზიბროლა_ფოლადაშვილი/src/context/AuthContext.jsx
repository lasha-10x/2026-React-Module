import { useState } from "react";
import { AuthContext } from "./AuthContextDefinition";
export function AuthProvider({ children, }) {
    const [username, setUsername] = useState(() => {
        return localStorage.getItem("10x-shop-username");
    });
    function login(name) {
        setUsername(name);
        localStorage.setItem("10x-shop-username", name);
    }
    function logout() {
        setUsername(null);
        localStorage.removeItem("10x-shop-username");
    }
    return (<AuthContext.Provider value={{
            username,
            isAuthenticated: username !== null,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>);
}
