import { createContext, useContext } from 'react';
/** The signed-out state, used as the initial value and after logout. */
export const GUEST = { username: '', isLoggedIn: false };
export const AuthContext = createContext(null);
/**
 * Reads the auth context, failing loudly when a component is rendered
 * outside AuthProvider rather than silently behaving as a guest.
 */
export function useAuth() {
    const value = useContext(AuthContext);
    if (value === null) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }
    return value;
}
