import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { STORAGE_KEYS } from "../utils/storageKeys";
// index.html-ის სკრიპტმა თემა უკვე ჩართო — აქედან ვკითხულობთ
function getInitialTheme() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try {
            localStorage.setItem(STORAGE_KEYS.theme, theme);
        }
        catch {
            // localStorage მიუწვდომელია — თემა უბრალოდ არ შეინახება
        }
    }, [theme]);
    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }
    const value = { theme, setTheme, toggleTheme };
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export default ThemeProvider;
