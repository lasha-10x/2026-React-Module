import { useState } from 'react';
import { AuthContext } from './AuthContext';
const GUEST = { username: '', isLoggedIn: false };
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(GUEST);
    const login = (username) => setUser({ username, isLoggedIn: true });
    const logout = () => setUser(GUEST);
    return <AuthContext value={{ ...user, login, logout }}>{children}</AuthContext>;
}
