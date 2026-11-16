import { useEffect, useRef, useState, } from "react";
import { ToastContext, } from "./toast-context";
const TOAST_DURATION = 4000;
export function ToastProvider({ children, }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());
    function showToast(message, type) {
        const id = crypto.randomUUID();
        const newToast = {
            id,
            message,
            type,
        };
        setToasts((previous) => [...previous, newToast]);
        const timer = window.setTimeout(() => {
            setToasts((previous) => previous.filter((toast) => toast.id !== id));
            timersRef.current.delete(id);
        }, TOAST_DURATION);
        timersRef.current.set(id, timer);
    }
    function removeToast(id) {
        const timer = timersRef.current.get(id);
        if (timer !== undefined) {
            window.clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach((timer) => {
                window.clearTimeout(timer);
            });
            timers.clear();
        };
    }, []);
    return (<ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>);
}
