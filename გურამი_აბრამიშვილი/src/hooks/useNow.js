import { useEffect, useState } from "react";
// Re-renders the component every `intervalMs` with a fresh Date.
export function useNow(intervalMs) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), intervalMs);
        return () => window.clearInterval(id); // without cleanup the timer would outlive the page
    }, [intervalMs]);
    return now;
}
