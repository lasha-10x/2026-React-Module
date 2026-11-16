import { useEffect } from "react";
import { useLocalStorage } from "@/hooks";
import { STORAGE_KEYS } from "@/utils";
import { ThemeContext } from "./ThemeContext";
/**
 * Provides theme state and toggle functionality to the entire application.
 * Synchronizes the active theme with localStorage and the HTML root element.
 */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, "dark");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
