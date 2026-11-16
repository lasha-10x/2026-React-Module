import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from './ToastContext';
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const timers = useRef([]);
    const showToast = useCallback((message) => {
        const id = nextId.current++;
        setToasts((current) => [...current, { id, message }]);
        const timer = window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 2500);
        timers.current.push(timer);
    }, []);
    useEffect(() => {
        const active = timers.current;
        return () => active.forEach((timer) => window.clearTimeout(timer));
    }, []);
    const value = useMemo(() => ({ showToast }), [showToast]);
    return (<ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (<div key={toast.id} className="rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
            {toast.message}
          </div>))}
      </div>
    </ToastContext.Provider>);
}
