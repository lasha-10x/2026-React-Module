import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { STORAGE_KEYS } from "../utils/storageKeys";
const GUEST = { username: "", isLoggedIn: false };
// მხოლოდ სახელს ვინახავთ — პაროლი არსად ინახება
function loadUser() {
    try {
        const username = localStorage.getItem(STORAGE_KEYS.user);
        return username ? { username, isLoggedIn: true } : GUEST;
    }
    catch {
        return GUEST;
    }
}
function AuthProvider({ children }) {
    const [user, setUser] = useState(loadUser);
    useEffect(() => {
        try {
            if (user.isLoggedIn) {
                localStorage.setItem(STORAGE_KEYS.user, user.username);
            }
            else {
                localStorage.removeItem(STORAGE_KEYS.user);
            }
        }
        catch {
            // localStorage მიუწვდომელია — სესია უბრალოდ არ შეინახება
        }
    }, [user]);
    function login(username) {
        setUser({ username, isLoggedIn: true });
    }
    function logout() {
        setUser(GUEST);
    }
    // Profile-ზე სახელის შეცვლა Header-შიც მაშინვე ჩანს
    function updateUsername(username) {
        setUser((prev) => (prev.isLoggedIn ? { ...prev, username } : prev));
    }
    const value = { user, login, logout, updateUsername };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default AuthProvider;
