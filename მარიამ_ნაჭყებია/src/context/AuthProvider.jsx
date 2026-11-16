import { useState } from 'react';
import { AuthContext } from './AuthContext';
export function AuthProvider({ children }) {
    const [username, setUsername] = useState(null);
    function login(name) {
        setUsername(name);
    }
    function logout() {
        setUsername(null);
    }
    const value = {
        username,
        isLoggedIn: username !== null,
        login,
        logout,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
