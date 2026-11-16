import { useState } from 'react';
import { AuthContext } from './authContext';
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    function login(username) {
        setUser({ username, isLoggedIn: true });
    }
    function logout() {
        setUser(null);
    }
    return (<AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
