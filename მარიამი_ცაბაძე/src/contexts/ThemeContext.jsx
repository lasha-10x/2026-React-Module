import { createContext, useContext, useEffect, useState } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storage';
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => StorageService.get(STORAGE_KEYS.theme, 'light'));
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        StorageService.set(STORAGE_KEYS.theme, theme);
    }, [theme]);
    return (<ThemeContext.Provider value={{
            theme,
            toggle: () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))
        }}>
      {children}
    </ThemeContext.Provider>);
}
export function useTheme() {
    const value = useContext(ThemeContext);
    if (!value)
        throw new Error('useTheme must be used inside ThemeProvider.');
    return value;
}
