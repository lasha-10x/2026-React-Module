import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { currentUserStorage, loadCurrentUser, loginUser, updateUser } from "./authStorage";
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(loadCurrentUser);
    useEffect(() => {
        if (user)
            currentUserStorage.set(user);
        else
            currentUserStorage.remove();
    }, [user]);
    const value = {
        user,
        login: (username, password) => setUser(loginUser(username, password)),
        logout: () => setUser(null),
        updateProfile: (changes) => {
            if (user)
                setUser(updateUser(user.username, changes));
        },
    };
    return <AuthContext value={value}>{children}</AuthContext>;
}
