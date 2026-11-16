import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import { themeStorage } from '../models/storage';
const ThemeContext = createContext(null);
/** Saved choice first, otherwise the operating system preference. */
function getInitialTheme() {
    const saved = themeStorage.get();
    if (saved)
        return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    // <html data-theme="..."> is what the Tailwind `dark` variant and the CSS variables react to.
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    const toggleTheme = useCallback(() => {
        const next = theme === 'dark' ? 'light' : 'dark';
        themeStorage.set(next);
        setTheme(next);
    }, [theme]);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useTheme must be used inside <ThemeProvider>');
    return context;
}
