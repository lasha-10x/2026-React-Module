import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { STORAGE_KEYS, StorageService } from '../utils/storage';
const themeStorage = new StorageService(STORAGE_KEYS.theme, (value) => value === 'light' || value === 'dark' ? value : undefined);
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const stored = themeStorage.read();
        return stored.ok ? stored.value ?? 'light' : 'light';
    });
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        themeStorage.write(theme);
    }, [theme]);
    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
    const theme = useContext(ThemeContext);
    if (!theme)
        throw new Error('ThemeProvider is required');
    return theme;
}
