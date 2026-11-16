import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(undefined);
// AuthProvider holds the login state in React using useState
export function AuthProvider({ children }) {
    // By default, the user is a guest (not logged in)
    const [user, setUser] = useState({
        username: '',
        isLoggedIn: false,
    });
    // Log in: save the username and set isLoggedIn to true
    function login(username) {
        setUser({
            username: username.trim(),
            isLoggedIn: true,
        });
    }
    // Log out: reset back to guest state
    function logout() {
        setUser({
            username: '',
            isLoggedIn: false,
        });
    }
    return (<AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
// Helper hook so any component can easily read `user`, `login`, and `logout`
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
