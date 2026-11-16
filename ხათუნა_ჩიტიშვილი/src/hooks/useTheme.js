import { useContext } from "react";
import { ThemeContext } from "@/context";
/**
 * Custom hook to safely consume the ThemeContext.
 * Throws an explicit error if used outside of a ThemeProvider.
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
