import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/authContext";
// სასწავლო redirect: სტუმარი /login-ზე მიდის და თან მიაქვს, საიდან მოვიდა
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user.isLoggedIn) {
        // replace: Back-ზე /checkout ↔ /login-ის წრე არ შეიქმნება
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    return children;
}
