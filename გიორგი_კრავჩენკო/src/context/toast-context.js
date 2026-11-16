import { createContext, useContext } from 'react';
export const ToastContext = createContext(null);
export function useToast() {
    const value = useContext(ToastContext);
    if (value === null) {
        throw new Error('useToast must be used inside a ToastProvider');
    }
    return value;
}
