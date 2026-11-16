import { createContext, useContext, useEffect, useState, } from 'react';
const ThemeContext = createContext(undefined);
// Load saved theme from localStorage (defaults to 'light')
function loadInitialTheme() {
    try {
        const saved = localStorage.getItem('shop_theme');
        if (saved === 'dark' || saved === 'light') {
            return saved;
        }
    }
    catch {
        // Fallback to light mode if localStorage is blocked
    }
    return 'light';
}
// ThemeProvider manages Light / Dark mode and syncs the `.dark` class on <html>
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(loadInitialTheme);
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('shop_theme', theme);
        }
        catch {
            // Ignore storage errors
        }
    }, [theme]);
    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return context;
}
