import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StorageService } from "@/models/StorageService";
import { isTheme } from "@/utils/guards";
import { STORAGE_KEYS } from "@/utils/constants";
const ThemeContext = createContext(null);
const themeStorage = new StorageService(STORAGE_KEYS.theme, isTheme);
function getInitialTheme() {
    const saved = themeStorage.get();
    if (saved !== null)
        return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    // data-theme on <html> switches the CSS variables defined in index.css.
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        themeStorage.set(theme);
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (ctx === null)
        throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}
