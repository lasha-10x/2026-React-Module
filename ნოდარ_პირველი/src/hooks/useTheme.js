import { useEffect, useState } from "react";
const STORAGE_KEY = "shop_theme";
function loadTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    }
    catch {
        return "light"; // localStorage მიუწვდომელია (მაგ. private რეჟიმი)
    }
}
export function useTheme() {
    const [theme, setTheme] = useState(loadTheme); // lazy init
    // თემა შეიცვალა → <html>-ზე კლასი + localStorage
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        catch {
            // შენახვა ვერ მოხერხდა: თემა მაინც მუშაობს ამ სესიაში
        }
    }, [theme]);
    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark");
    }
    return { theme, toggleTheme };
}
