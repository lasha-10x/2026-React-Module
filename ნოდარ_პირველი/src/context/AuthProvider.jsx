import { useState } from "react";
import { AuthContext } from "./authContext";
// "სტუმარი": საწყისი მდგომარეობა და ის, რაც logout-ის შემდეგ ბრუნდება
const GUEST = { username: "", isLoggedIn: false };
// სასწავლო Login: მხოლოდ React state. სერვერი და პაროლის შენახვა არ არის
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(GUEST);
    function login(username) {
        // ახალი ობიექტი (immutable), trim: ზედმეტი ჰარები ბოლოებში
        setUser({ username: username.trim(), isLoggedIn: true });
    }
    function logout() {
        setUser(GUEST); // კალათას არ ვეხებით (PRD P0.3)
    }
    return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>;
}
