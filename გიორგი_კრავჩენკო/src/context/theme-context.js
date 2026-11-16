import { createContext, useContext } from 'react';
export const ThemeContext = createContext(null);
export function useTheme() {
    const value = useContext(ThemeContext);
    if (value === null) {
        throw new Error('useTheme must be used inside a ThemeProvider');
    }
    return value;
}
