import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isStringList } from "@/utils/guards";
import { SEARCH_HISTORY_LIMIT, STORAGE_KEYS } from "@/utils/constants";
// Last searches, newest first, saved in localStorage. Duplicates (ignoring case) move to the top.
export function useSearchHistory() {
    const [history, setHistory] = useLocalStorage(STORAGE_KEYS.searchHistory, [], isStringList);
    const add = useCallback((query) => {
        const q = query.trim();
        if (q === "")
            return;
        setHistory((prev) => [q, ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, SEARCH_HISTORY_LIMIT));
    }, [setHistory]);
    const remove = useCallback((query) => setHistory((prev) => prev.filter((item) => item !== query)), [setHistory]);
    const clear = useCallback(() => setHistory([]), [setHistory]);
    return { history, add, remove, clear };
}
