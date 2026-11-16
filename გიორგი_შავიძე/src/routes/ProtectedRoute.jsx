import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (!user.isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
    }
    return <>{children}</>;
};
