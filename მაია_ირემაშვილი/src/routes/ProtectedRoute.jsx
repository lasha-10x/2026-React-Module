import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user.isLoggedIn) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    return children;
}
export default ProtectedRoute;
