import { createContext, startTransition, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSavedProfiles, emptyProfile, readProfile, saveProfile } from '../utils/profileStorage';
const guestSession = { username: '', isLoggedIn: false, profile: emptyProfile };
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(guestSession);
    const { username, isLoggedIn, profile } = session;
    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || username;
    const navigate = useNavigate();
    function login(username) {
        setSession({ username, isLoggedIn: true, profile: readProfile(username) });
    }
    function logout() {
        // Commit the session reset with the route change so RequireAuth doesn't redirect first.
        startTransition(() => {
            setSession(guestSession);
            navigate('/', { replace: true });
        });
    }
    function updateProfile(next) {
        if (!isLoggedIn || !saveProfile(username, next))
            return false;
        setSession((current) => ({ ...current, profile: next }));
        return true;
    }
    function clearProfiles() {
        if (!isLoggedIn || !clearSavedProfiles())
            return false;
        setSession((current) => ({ ...current, profile: emptyProfile }));
        return true;
    }
    return (<AuthContext.Provider value={{ ...session, login, logout, displayName, updateProfile, clearProfiles }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
