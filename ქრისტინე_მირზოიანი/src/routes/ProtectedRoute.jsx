import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
export function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user.isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
    }
    return <>{children}</>;
}
