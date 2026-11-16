import { createContext, useContext, useEffect, useState, } from "react";
const ThemeContext = createContext(null);
// Read the saved preference and default to light
function getInitialTheme() {
    try {
        return localStorage.getItem("shop_theme") === "dark"
            ? "dark"
            : "light";
    }
    catch {
        return "light";
    }
}
function ThemeProvider({ children }) {
    // Read storage only when this provider first mounts
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        // Apply the theme to the root HTML element
        document.documentElement.classList.toggle("dark", theme === "dark");
        // Match browser controls such as scrollbars to the selected theme
        document.documentElement.style.colorScheme = theme;
        try {
            localStorage.setItem("shop_theme", theme);
        }
        catch {
            // Keep the toggle working even when storage is unavailable
        }
    }, [theme]);
    function toggleTheme() {
        setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light");
    }
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === null) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return context;
}
export default ThemeProvider;
