import { createContext, useContext, useState } from 'react';
const guestUser = { username: '', isLoggedIn: false };
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(guestUser);
    const login = (username) => {
        setUser({ username, isLoggedIn: true });
    };
    const logout = () => {
        setUser(guestUser);
    };
    const updateProfile = (values) => {
        setUser((prev) => ({ ...prev, ...values }));
    };
    return (<AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
