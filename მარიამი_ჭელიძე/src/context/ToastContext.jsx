// გლობალურ შეტყობინებებს ქმნის და სამი წამის შემდეგ ავტომატურად შლის.
import { createContext, useCallback, useContext, useEffect, useRef, useState, } from "react";
import { Toast } from "../components/Toast/Toast";
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    const timers = useRef(new Map());
    const removeToast = useCallback((id) => {
        // შეტყობინების წაშლისას მის ავტომატურ ტაიმერსაც ვაუქმებთ.
        const timer = timers.current.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);
    const addToast = useCallback((message, type) => {
        // თითოეულ შეტყობინებას ID ენიჭება და სამ წამში ავტომატურად იხურება.
        const id = nextId.current + 1;
        nextId.current = id;
        setToasts((current) => [...current, { id, message, type }]);
        const timer = setTimeout(() => {
            timers.current.delete(id);
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3000);
        timers.current.set(id, timer);
    }, []);
    // Provider-ის მოხსნისას დარჩენილ ტაიმერებს ვასუფთავებთ.
    useEffect(() => () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
    }, []);
    return (<ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (<Toast key={toast.id} toast={toast} onClose={removeToast}/>))}
      </div>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider.");
    }
    return context;
}
