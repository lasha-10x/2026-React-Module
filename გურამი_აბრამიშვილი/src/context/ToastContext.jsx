import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
const ToastContext = createContext(null);
const TOAST_LIFETIME_MS = 3000;
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);
    const timers = useRef(new Set());
    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);
    const toast = useCallback((message, kind = "success") => {
        const id = nextId.current++;
        setToasts((list) => [...list.slice(-3), { id, message, kind }]);
        const timer = window.setTimeout(() => {
            timers.current.delete(timer);
            dismiss(id);
        }, TOAST_LIFETIME_MS);
        timers.current.add(timer);
    }, [dismiss]);
    // Clear pending timers when the provider unmounts.
    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((t) => window.clearTimeout(t));
    }, []);
    const value = useMemo(() => ({ toast }), [toast]);
    return (<ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {toasts.map((t) => (<div key={t.id} className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${t.kind === "success" ? "bg-ink text-canvas" : "bg-danger text-white"}`}>
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="-mr-1 inline-flex size-6 items-center justify-center rounded opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current">
              ×
            </button>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (ctx === null)
        throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
