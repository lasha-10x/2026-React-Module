import { useState } from 'react';
import { AuthContext } from './AuthContext';
const GUEST_USER = { username: '', isLoggedIn: false };
const STORAGE_KEY = 'shop_user';
// ვკითხულობთ შენახულ username-ს: თუ არის, მომხმარებელი შესულია, თუ არა, სტუმარია
const loadUser = () => {
    const username = localStorage.getItem(STORAGE_KEY);
    return username ? { username, isLoggedIn: true } : GUEST_USER;
};
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadUser);
    const login = (username) => {
        localStorage.setItem(STORAGE_KEY, username);
        setUser({ username, isLoggedIn: true });
    };
    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(GUEST_USER);
    };
    const value = { user, login, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthProvider;
