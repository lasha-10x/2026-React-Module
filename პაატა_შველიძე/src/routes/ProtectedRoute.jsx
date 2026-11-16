import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user.isLoggedIn) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    return <>{children}</>;
}
