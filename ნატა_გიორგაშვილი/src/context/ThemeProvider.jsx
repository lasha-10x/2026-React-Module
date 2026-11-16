import { useEffect, useState } from 'react';
import { ThemeContext } from './theme-context';
const STORAGE_KEY = 'shop_theme';
function getInitialTheme() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark')
            return saved;
    }
    catch {
        // Storage may be blocked; fall back to the system preference.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    // Sync the theme to the <html> element and to localStorage after every change.
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        catch {
            // Ignore: the theme still works for this visit.
        }
    }, [theme]);
    const value = {
        theme,
        toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    };
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
