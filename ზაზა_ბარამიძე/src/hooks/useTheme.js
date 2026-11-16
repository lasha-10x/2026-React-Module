import { useEffect, useState } from 'react';
const STORAGE_KEY = 'shop_theme';
const loadTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    }
    catch {
        return 'light';
    }
};
const useTheme = () => {
    const [theme, setTheme] = useState(loadTheme);
    // theme შეიცვალა: <html>-ზე ვრთავთ/ვთიშავთ "dark" კლასს და ვინახავთ არჩევანს
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        catch {
            /* შენახვა ვერ მოხერხდა: თემა მაინც მუშაობს ამ სესიაში */
        }
    }, [theme]);
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };
    return { theme, toggleTheme };
};
export default useTheme;
