import { useEffect, useState } from "react";
import { ThemeContext } from "./theme-context";
const THEME_STORAGE_KEY = "10x-shop-theme";
function getInitialTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    }
    catch {
        // Use the default theme if storage is unavailable.
    }
    return "light";
}
export function ThemeProvider({ children, }) {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.style.colorScheme = theme;
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
        catch {
            // Theme still works during the current session.
        }
    }, [theme]);
    function toggleTheme() {
        setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
    }
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>);
}
