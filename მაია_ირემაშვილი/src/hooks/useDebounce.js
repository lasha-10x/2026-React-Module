import { useEffect, useState } from "react";
// აბრუნებს value-ს, მაგრამ მხოლოდ მაშინ, როცა ის delay მილიწამის განმავლობაში აღარ შეცვლილა
export function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
