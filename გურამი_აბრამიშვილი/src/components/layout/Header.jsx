import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
const linkBase = "relative inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-ring";
function navClass({ isActive }) {
    return `${linkBase} ${isActive ? "bg-brand-soft text-brand dark:bg-surface-2 dark:text-accent" : "text-ink hover:bg-surface-2"}`;
}
function CountBadge({ count, label }) {
    if (count === 0)
        return null; // 0 -> badge hidden
    return (<span aria-label={`${count} ${label}`} className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
      {count}
    </span>);
}
export default function Header() {
    const { user, isLoggedIn, logout } = useAuth();
    const { itemCount } = useCart();
    const { items: wishlist } = useWishlist();
    const { items: compareItems } = useCompare();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);
    const greeting = user === null ? "" : user.firstName.trim() !== "" ? user.firstName : user.username;
    function handleLogout() {
        logout(); // the cart is NOT cleared on logout
        closeMenu();
        navigate("/");
    }
    const links = (<>
      <NavLink to="/" end className={navClass} onClick={closeMenu}>
        Catalog
      </NavLink>
      <NavLink to="/wishlist" className={navClass} onClick={closeMenu}>
        Wishlist
        <CountBadge count={wishlist.length} label="saved items"/>
      </NavLink>
      <NavLink to="/compare" className={navClass} onClick={closeMenu}>
        Compare
        <CountBadge count={compareItems.length} label="products to compare"/>
      </NavLink>
      <NavLink to="/cart" className={navClass} onClick={closeMenu}>
        Cart
        <CountBadge count={itemCount} label="items in cart"/>
      </NavLink>
      {isLoggedIn && (<>
          <NavLink to="/orders" className={navClass} onClick={closeMenu}>
            Orders
          </NavLink>
          <NavLink to="/profile" className={navClass} onClick={closeMenu}>
            Profile
          </NavLink>
        </>)}
    </>);
    const actions = (<>
      <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} className={`${linkBase} border border-line px-3 hover:bg-surface-2`}>
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        <span className="md:sr-only">{theme === "dark" ? "Light" : "Dark"}</span>
      </button>
      {isLoggedIn ? (<button type="button" onClick={handleLogout} className={`${linkBase} border border-line hover:bg-surface-2`}>
          Log out
        </button>) : (<NavLink to="/login" className={`${linkBase} bg-brand text-white hover:bg-brand-hover`} onClick={closeMenu}>
          Log in
        </NavLink>)}
    </>);
    return (<header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" onClick={closeMenu} className="rounded-lg text-xl font-extrabold tracking-tight focus-ring">
          <span className="text-brand dark:text-accent">10X</span> Shop
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn && <span className="max-w-32 truncate text-sm text-muted">Hi, {greeting}</span>}
          {actions}
        </div>

        {/* Mobile burger */}
        <button type="button" className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-xl hover:bg-surface-2 focus-ring md:hidden" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          {itemCount > 0 && !menuOpen && <span className="sr-only">{itemCount} items in cart</span>}
        </button>
      </div>

      {menuOpen && (<div id="mobile-menu" className="border-t border-line bg-surface md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-3">
            {isLoggedIn && <p className="px-3 pb-1 text-sm text-muted">Signed in as {greeting}</p>}
            {links}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-3">{actions}</div>
          </nav>
        </div>)}
    </header>);
}
