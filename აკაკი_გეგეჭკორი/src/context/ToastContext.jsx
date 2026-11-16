import { createContext, useCallback, useContext, useEffect, useRef, useState, } from "react";
const TOAST_DURATION_MS = 3000;
const ToastContext = createContext(undefined);
const toastStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-slate-200 bg-white text-slate-800",
};
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const timers = useRef(new Map());
    const dismiss = useCallback((id) => {
        const timer = timers.current.get(id);
        if (timer !== undefined) {
            window.clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const showToast = useCallback((message, type = "info") => {
        const id = nextId.current++;
        setToasts((prev) => [...prev, { id, message, type }]);
        timers.current.set(id, window.setTimeout(() => dismiss(id), TOAST_DURATION_MS));
    }, [dismiss]);
    useEffect(() => {
        const active = timers.current;
        return () => {
            active.forEach((timer) => window.clearTimeout(timer));
            active.clear();
        };
    }, []);
    return (<ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => (<div key={toast.id} role="status" className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${toastStyles[toast.type]}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="cursor-pointer text-lg leading-none opacity-60 transition hover:opacity-100">
              &times;
            </button>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
