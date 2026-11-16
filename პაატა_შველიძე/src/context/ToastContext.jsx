import { createContext, useCallback, useContext, useMemo, useRef, useState, } from 'react';
import { ToastViewport, } from '../components/ui/ToastViewport';
const ToastContext = createContext(undefined);
const MAX_VISIBLE_TOASTS = 3;
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const showToast = useCallback((message, variant = 'success') => {
        const id = nextId.current;
        nextId.current += 1;
        setToasts((prev) => [...prev, { id, message, variant }].slice(-MAX_VISIBLE_TOASTS));
    }, []);
    const value = useMemo(() => ({ showToast }), [showToast]);
    return (<ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss}/>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used inside ToastProvider');
    }
    return context;
}
