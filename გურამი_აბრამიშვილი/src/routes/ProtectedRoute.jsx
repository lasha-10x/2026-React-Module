import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// Simple learning guard: a guest is sent to /login and returns to the page they wanted after logging in.
export default function ProtectedRoute() {
    const { isLoggedIn, isLoggingOut } = useAuth();
    const location = useLocation();
    if (!isLoggedIn) {
        // The user pressed "Log out" on a protected page: the logout handler is already navigating to the
        // catalog. Redirecting to /login here would race with that navigation and win, so render nothing.
        // (This also covers a logout that happens while the lazy page chunk is still loading.)
        if (isLoggingOut())
            return null;
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    return <Outlet />;
}
