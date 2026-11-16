import { useState } from "react";
import { StorageService } from "../services/StorageService";
import { STORAGE_KEYS } from "../services/storageKeys";
import { emptyProfile, loadProfile, migrateLegacyProfile, saveProfile as storeProfile, } from "../services/profileStorage";
import { AuthContext } from "./auth-context";
function isUser(value) {
    return value === null || (typeof value === "object" && "username" in value && typeof value.username === "string");
}
// Only the username is remembered; no password or token is ever stored.
const userStorage = new StorageService(STORAGE_KEYS.user, isUser, null);
/** The signed-in shopper's own profile; a first sign-in records "member since" once. */
function profileFor(username) {
    const saved = loadProfile(username);
    if (saved.memberSince)
        return saved;
    const withDate = { ...saved, memberSince: new Date().toISOString() };
    storeProfile(username, withDate);
    return withDate;
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => userStorage.load());
    const [profile, setProfile] = useState(() => {
        const current = userStorage.load();
        migrateLegacyProfile(current?.username ?? null);
        return current ? profileFor(current.username) : emptyProfile;
    });
    function login(username) {
        const trimmedUsername = username.trim();
        if (!trimmedUsername)
            return;
        const nextUser = { username: trimmedUsername };
        setUser(nextUser);
        userStorage.save(nextUser);
        setProfile(profileFor(trimmedUsername));
    }
    function logout() {
        setUser(null);
        setProfile(emptyProfile);
        userStorage.clear();
    }
    function updateProfile(fields) {
        if (!user)
            return;
        const next = { ...profile, ...fields, updatedAt: new Date().toISOString() };
        setProfile(next);
        storeProfile(user.username, next);
    }
    return (<AuthContext.Provider value={{ user, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>);
}
