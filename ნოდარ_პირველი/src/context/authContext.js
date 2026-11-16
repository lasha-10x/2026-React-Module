import { createContext, useContext } from "react";
// null: Provider-ის გარეთ Context ცარიელია
export const AuthContext = createContext(null);
// საკუთარი hook, ზუსტად ისე, როგორც useCart
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return context;
}
