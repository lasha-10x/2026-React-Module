/**
 * NOTE: the simulated login and the user's profile, shared with the whole app through React Context.
 * Why it exists: the Header, the Checkout guard and the Login page all need to know who is logged in.
 * Passing that through props would mean threading it through every component in between ("prop drilling").
 * Connects to: `App.tsx` wraps the app in `AuthProvider`, and anything can then call `useAuth()`.
 *
 * This is NOT real authentication, and the PRD says it must not be: no server, no token, and the password
 * is never kept anywhere. In a browser-only app a real login is impossible, because anyone can edit
 * this state with developer tools.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StorageService } from "@/models/StorageService";
import { STORAGE_KEYS } from "@/utils/constants";
import { parseAuthUser, parseStoredProfiles } from "@/utils/guards";
/** Starts as null so `useAuth` can notice when a component is used outside the provider. */
const AuthContext = createContext(null);
/** Only the username is ever saved. There is no password to save, because login never keeps one. */
const userStorage = new StorageService(STORAGE_KEYS.user, parseAuthUser);
/** Owns who is logged in and the saved profiles. Every page reads them through `useAuth`, with no props passed down. */
export function AuthProvider({ children }) {
    /** Who is logged in. Restored from storage, so a reload on /orders doesn't send you back to Login. */
    const [user, setUser] = useState(() => userStorage.get());
    /** Everyone's saved profiles, by username, so logging out and back in keeps your details. */
    const [profiles, saveProfiles] = useLocalStorage(STORAGE_KEYS.profiles, {}, parseStoredProfiles);
    // Saves the login whenever it changes. Logging out removes it.
    useEffect(() => {
        if (user === null) {
            userStorage.remove();
        }
        else {
            userStorage.set(user);
        }
    }, [user]);
    // Follows a login or logout in another tab, so two tabs can't disagree about who is using the shop. Saving the
    // same value again fires no event, so the effect above can't start an endless loop between tabs.
    useEffect(() => {
        function handleStorage(event) {
            if (event.key === STORAGE_KEYS.user || event.key === null) {
                setUser(userStorage.get());
            }
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);
    /** `useCallback` keeps the same function between renders, so memoised children don't redraw needlessly. */
    const login = useCallback((username) => setUser({ username }), []);
    const logout = useCallback(() => setUser(null), []);
    /**
     * Refuses a username that already has a profile here, so signing up can't overwrite someone's details. If saving
     * the email fails, the login still works, because it lives in React state, and the page says what was lost.
     */
    const signUp = useCallback((username, email) => {
        if (Object.hasOwn(profiles, username)) {
            return "taken";
        }
        const saved = saveProfiles({ ...profiles, [username]: { firstName: "", lastName: "", email, phone: "" } });
        setUser({ username });
        return saved ? "created" : "email-not-saved";
    }, [profiles, saveProfiles]);
    const username = user?.username ?? null;
    const updateProfile = useCallback((profile) => username !== null && saveProfiles({ ...profiles, [username]: profile }), [username, profiles, saveProfiles]);
    /**
     * `useMemo` builds a new value only when something in it changes. Without it, every render of this provider
     * would create a new object, and every component using `useAuth` would redraw.
     *
     * `Object.hasOwn` matters because any username is allowed. Every plain object inherits `constructor`, so
     * `profiles["constructor"]` would find a function and treat it as a saved profile. See DEBUG-LOG.md.
     */
    const value = useMemo(() => {
        const profile = username !== null && Object.hasOwn(profiles, username) ? profiles[username] : null;
        const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
        return {
            user,
            isLoggedIn: user !== null,
            profile,
            displayName: fullName !== "" ? fullName : username,
            login,
            signUp,
            logout,
            updateProfile,
        };
    }, [user, username, profiles, login, signUp, logout, updateProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
/**
 * How components read the login state. Throwing here gives a clear message if the provider is missing,
 * and it means callers never have to handle `null`.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }
    return context;
}
