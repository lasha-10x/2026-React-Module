import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { themeStorage } from "../models/storage";
const ThemeContext = createContext(null);
function getInitialTheme() {
    const saved = themeStorage.get();
    if (saved)
        return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    // data-theme on <html> drives both the CSS variables and Tailwind's `dark:` variant.
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        themeStorage.set(theme);
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), []);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error("useTheme must be used inside <ThemeProvider>");
    return context;
}
