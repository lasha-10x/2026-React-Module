import { useState } from 'react';
import { AuthContext } from './AuthContext';
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    function login(username) {
        const trimmedUsername = username.trim();
        if (!trimmedUsername)
            return false;
        setUser({ username: trimmedUsername });
        return true;
    }
    function updateUsername(username) {
        const trimmedUsername = username.trim();
        if (!user || !trimmedUsername)
            return false;
        setUser((currentUser) => {
            if (!currentUser || currentUser.username === trimmedUsername) {
                return currentUser;
            }
            return { ...currentUser, username: trimmedUsername };
        });
        return true;
    }
    return (<AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, updateUsername, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>);
}
