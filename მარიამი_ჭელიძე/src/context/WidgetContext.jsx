import { createContext, useCallback, useContext, useState } from "react";
const WidgetContext = createContext(undefined);
export function WidgetProvider({ children }) {
    const [activeWidget, setActiveWidget] = useState(null);
    const toggleWidget = useCallback((widget) => {
        setActiveWidget((current) => current === widget ? null : widget);
    }, []);
    const closeWidget = useCallback(() => setActiveWidget(null), []);
    return (<WidgetContext.Provider value={{ activeWidget, toggleWidget, closeWidget }}>
      {children}
    </WidgetContext.Provider>);
}
export function useWidgets() {
    const context = useContext(WidgetContext);
    if (!context)
        throw new Error("useWidgets must be used within a WidgetProvider.");
    return context;
}
