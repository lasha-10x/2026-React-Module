import { useEffect, useState } from "react";
/** Returns `value` only after it stopped changing for `delay` ms (5 keystrokes → 1 request). */
export function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
