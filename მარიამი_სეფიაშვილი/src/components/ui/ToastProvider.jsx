import { useRef, useState } from "react";
import { ToastContext } from "./ToastContext";
const TOAST_DURATION = 2500;
const MAX_TOASTS = 3;
export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    function showToast(message, variant = "success") {
        const id = nextId.current++;
        setToasts((current) => [...current, { id, message, variant }].slice(-MAX_TOASTS));
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, TOAST_DURATION);
    }
    return (<ToastContext value={{ showToast }}>
      {children}
      <div role="status" aria-live="polite" className="fixed inset-x-0 top-4 md:top-24 z-50 flex flex-col items-center md:items-end gap-2.5 px-4 md:px-10 pointer-events-none">
        {toasts.map((toast) => (<p key={toast.id} className={`px-5.5 py-3 rounded-full border-2 border-sticker text-[15px] font-extrabold shadow-sticker ${toast.variant === "error" ? "bg-danger text-white dark:text-coal" : "bg-coal text-white"}`}>
            {toast.message}
          </p>))}
      </div>
    </ToastContext>);
}
