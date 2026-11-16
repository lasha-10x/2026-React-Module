import { useState } from 'react';
import { AuthContext } from './auth-context';
const guest = { username: '', isLoggedIn: false };
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(guest);
    const value = {
        user,
        login: (username) => setUser({ username, isLoggedIn: true }),
        logout: () => setUser(guest),
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
