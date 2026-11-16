import { useEffect, useState } from "react";
import { StorageService } from "../services/StorageService";
import { STORAGE_KEYS } from "../services/storageKeys";
import { ThemeContext } from "./theme-context";
const isTheme = (value) => value === "light" || value === "dark";
const themeStorage = new StorageService(STORAGE_KEYS.theme, isTheme, "light");
function initialTheme() {
    if (localStorage.getItem(STORAGE_KEYS.theme) !== null)
        return themeStorage.load();
    // Start new visitors in the storefront's light theme. Dark mode is opt-in
    // through the theme toggle and remains available on later visits.
    return "light";
}
/** One theme for the whole app: the Header and Profile switches both use this context. */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
    }, [theme]);
    function toggleTheme() {
        setTheme((current) => {
            const next = current === "dark" ? "light" : "dark";
            themeStorage.save(next);
            return next;
        });
    }
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
