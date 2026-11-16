import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { authenticate, deleteSession, registerAccount, restoreSession } from '../api/auth';
import { authReducer, canAccessAccount, initialAuthState } from './state';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);
    const active = useRef(null);
    // Refresh-ის შემდეგ cookie ავტომატურად მიჰყვება მოთხოვნას, React კი მომხმარებლის მონაცემებს თავიდან ტვირთავს.
    useEffect(() => {
        if (active.current && !active.current.signal.aborted)
            return () => active.current?.abort();
        const controller = new AbortController();
        active.current = controller;
        void restoreSession(controller.signal).then((session) => {
            if (active.current !== controller || controller.signal.aborted)
                return;
            dispatch(session ? { type: 'authenticated', session } : { type: 'guest' });
        }).catch(() => {
            if (active.current === controller && !controller.signal.aborted) {
                dispatch({ type: 'guest', notice: 'We couldn’t restore your session. Refresh to retry or sign in again.' });
            }
        }).finally(() => {
            if (active.current === controller)
                active.current = null;
        });
        return () => active.current?.abort();
    }, []);
    useEffect(() => {
        if (state.status !== 'authenticated')
            return;
        function expireIfNeeded() {
            if (state.status === 'authenticated' && Date.now() >= state.session.expiresAt) {
                dispatch({ type: 'guest', notice: 'Your session has expired. Please sign in again.' });
            }
        }
        const timer = window.setTimeout(expireIfNeeded, Math.max(0, state.session.expiresAt - Date.now()));
        window.addEventListener('focus', expireIfNeeded);
        return () => { window.clearTimeout(timer); window.removeEventListener('focus', expireIfNeeded); };
    }, [state]);
    async function login(credentials, callerSignal) {
        active.current?.abort();
        const controller = new AbortController();
        active.current = controller;
        const signal = AbortSignal.any([controller.signal, callerSignal]);
        dispatch({ type: 'begin' });
        try {
            const session = await authenticate(credentials, signal);
            if (signal.aborted || active.current !== controller)
                throw new DOMException('Request cancelled', 'AbortError');
            dispatch({ type: 'authenticated', session });
        }
        catch (error) {
            if (active.current === controller)
                dispatch({ type: 'guest' });
            throw error;
        }
        finally {
            if (active.current === controller)
                active.current = null;
        }
    }
    const endSession = useCallback((notice) => {
        active.current?.abort();
        active.current = null;
        dispatch({ type: 'guest', notice });
    }, []);
    async function logout() {
        if (active.current)
            return false;
        const controller = new AbortController();
        active.current = controller;
        try {
            await deleteSession(controller.signal);
            if (controller.signal.aborted)
                return false;
            endSession('You have signed out.');
            return true;
        }
        finally {
            if (active.current === controller)
                active.current = null;
        }
    }
    const invalidateSession = useCallback(() => endSession('Your session has ended. Please sign in again.'), [endSession]);
    return <AuthContext.Provider value={{
            user: canAccessAccount(state) ? state.session?.user ?? null : null,
            status: state.status === 'authenticated' && !canAccessAccount(state) ? 'guest' : state.status, notice: state.notice,
            login, logout, invalidateSession, register: registerAccount,
        }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
