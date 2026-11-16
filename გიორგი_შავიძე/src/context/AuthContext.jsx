import { createContext, useContext, useState } from "react";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("shop_user");
        return saved ? JSON.parse(saved) : { username: "", isLoggedIn: false };
    });
    const login = (username) => {
        const newUser = { username, isLoggedIn: true };
        setUser(newUser);
        localStorage.setItem("shop_user", JSON.stringify(newUser));
    };
    const logout = () => {
        // 🛑 ლოგაუთისას იშლება ავტორიზაცია და ყველა ლოკალური დემო მონაცემი
        localStorage.removeItem("shop_user");
        localStorage.removeItem("shop_cart");
        localStorage.removeItem("shop_orders");
        localStorage.removeItem("shop_stock_overrides");
        localStorage.removeItem("shop_reviews");
        setUser({ username: "", isLoggedIn: false });
        // 🔄 საწყის მდგომარეობაზე დაბრუნება და მთავარ გვერდზე გადამისამართება
        window.location.href = "/";
    };
    return (<AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
};
