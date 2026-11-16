import { createContext, useCallback, useContext, useState } from 'react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const show = useCallback((message) => {
        const id = Date.now() + Math.random();
        setToasts((current) => [
            ...current,
            {
                id,
                message
            }
        ]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 2800);
    }, []);
    return (<ToastContext.Provider value={{
            show
        }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (<div className="toast" role="status" key={toast.id}>
            {toast.message}
          </div>))}
      </div>
    </ToastContext.Provider>);
}
export function useToast() {
    const value = useContext(ToastContext);
    if (!value)
        throw new Error('useToast must be used inside ToastProvider.');
    return value;
}
