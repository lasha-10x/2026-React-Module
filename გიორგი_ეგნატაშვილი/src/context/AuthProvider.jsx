import { useEffect, useState } from 'react';
import { AuthContext, USER_STORAGE_KEY } from './authContext';
/**
 * AuthProvider — Global Authentication State Provider
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem(USER_STORAGE_KEY);
            return savedUser ? JSON.parse(savedUser) : null;
        }
        catch {
            return null;
        }
    });
    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            }
            else {
                localStorage.removeItem(USER_STORAGE_KEY);
            }
        }
        catch (err) {
            console.error('Failed to save user session to localStorage', err);
        }
    }, [user]);
    const login = (newUser) => {
        setUser(newUser);
    };
    const logout = () => {
        setUser(null);
    };
    return (<AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
        }}>
      {children}
    </AuthContext.Provider>);
}
