import { createContext, useState } from 'react';
const USERS_KEY = 'shop_users';
const TEST_USER = 'emilys';
const TEST_PASSWORD = 'emilyspass';
function readUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        if (typeof parsed !== 'object' || parsed === null)
            return {};
        const users = {};
        for (const [name, password] of Object.entries(parsed)) {
            if (typeof password === 'string')
                users[name] = password;
        }
        return users;
    }
    catch {
        return {};
    }
}
function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    catch {
        // storage can be blocked; the user is still logged in for this visit
    }
}
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
    user: null,
    login: () => false,
    register: () => null,
    logout: () => { },
});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // Simulation only: a real app would never keep passwords in the browser.
    const login = (username, password) => {
        const key = username.toLowerCase();
        const expected = key === TEST_USER ? TEST_PASSWORD : readUsers()[key];
        if (expected === undefined || expected !== password)
            return false;
        setUser(username);
        return true;
    };
    // Returns an error message, or null when the account was created.
    const register = (username, password) => {
        const key = username.toLowerCase();
        const users = readUsers();
        if (key === TEST_USER || key in users)
            return 'This username is already taken';
        saveUsers({ ...users, [key]: password });
        setUser(username);
        return null;
    };
    const logout = () => setUser(null);
    return (<AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>);
}
