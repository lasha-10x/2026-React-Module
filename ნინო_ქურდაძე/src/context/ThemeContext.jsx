import { createContext, useContext, useEffect, useState } from "react";
import { storageGet, storageSet } from "@/utils/storage";
const ThemeContext = createContext(undefined);
const THEME_STORAGE_KEY = "shop_theme";
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // If inline script in index.html already set html.dark, honor that immediately
        if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
            return "dark";
        }
        const saved = storageGet(THEME_STORAGE_KEY);
        if (saved === "dark" || saved === "light") {
            return saved;
        }
        return "light";
    });
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.setAttribute("data-theme", "dark");
        }
        else {
            root.classList.remove("dark");
            root.setAttribute("data-theme", "light");
        }
        storageSet(THEME_STORAGE_KEY, theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
};
