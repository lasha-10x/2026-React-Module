import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import ToastViewport from '../components/ui/ToastViewport';
const ToastContext = createContext(null);
const TOAST_DURATION_MS = 3500;
const MAX_TOASTS = 3;
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const timers = useRef(new Set());
    // Clear pending timers when the provider unmounts.
    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);
    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);
    const showToast = useCallback((message, kind = 'success') => {
        const id = nextId.current++;
        setToasts((current) => [...current, { id, message, kind }].slice(-MAX_TOASTS));
        const timer = setTimeout(() => {
            timers.current.delete(timer);
            dismiss(id);
        }, TOAST_DURATION_MS);
        timers.current.add(timer);
    }, [dismiss]);
    const value = useMemo(() => ({ showToast }), [showToast]);
    return (<ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss}/>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context)
        throw new Error('useToast must be used inside <ToastProvider>');
    return context;
}
