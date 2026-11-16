import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const login = (name) => {
        setUsername(name);
        setIsLoggedIn(true);
    };
    const logout = () => {
        setUsername('');
        setIsLoggedIn(false);
    };
    return (<AuthContext.Provider value={{
            username,
            isLoggedIn,
            login,
            logout,
        }}>
      {children}
    </AuthContext.Provider>);
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
