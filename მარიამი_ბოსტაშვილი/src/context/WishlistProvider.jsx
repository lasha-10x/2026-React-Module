import { useState } from "react";
import { WishlistContext } from "./wishlist-context";
export function WishlistProvider({ children }) {
    const [products, setProducts] = useState([]);
    function toggle(product) {
        setProducts((list) => list.some((item) => item.id === product.id)
            ? list.filter((item) => item.id !== product.id) : [...list, product]);
    }
    return <WishlistContext.Provider value={{ products, toggle }}>{children}</WishlistContext.Provider>;
}
