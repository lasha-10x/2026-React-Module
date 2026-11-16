import { useEffect, useState } from "react";
export function useDebounce(value, delayMs) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timer); // cleanup: a newer keystroke cancels the older timer
    }, [value, delayMs]);
    return debounced;
}
