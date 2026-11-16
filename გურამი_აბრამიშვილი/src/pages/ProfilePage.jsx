import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeading from "@/components/ui/PageHeading";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { reviewsStorage } from "@/hooks/useReviews";
import { pluralize } from "@/utils/format";
import { validateProfile } from "@/utils/validation";
export default function ProfilePage() {
    useDocumentTitle("Profile");
    const { user, logout, updateProfile } = useAuth();
    const { clearCart } = useCart();
    const { orders, clearOrders } = useOrders();
    const { clear: clearWishlist } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();
    const form = useForm({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
    }, validateProfile);
    const submit = form.handleSubmit((values) => {
        updateProfile({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
        });
        toast("Profile updated ✓");
    });
    function handleClearData() {
        if (!window.confirm("Clear your cart, orders, reviews and wishlist? Your login and theme are kept."))
            return;
        clearCart();
        clearOrders();
        clearWishlist();
        reviewsStorage.remove();
        toast("Local data cleared");
    }
    function handleLogout() {
        logout();
        navigate("/");
    }
    const field = (name) => ({
        name,
        value: form.values[name],
        onChange: form.handleChange,
        onBlur: form.handleBlur,
        error: form.fieldError(name),
    });
    return (<div className="mx-auto max-w-3xl">
      <PageHeading title="Profile" subtitle={user === null ? undefined : `Signed in as ${user.username} · ${pluralize(orders.length, "order")}`}/>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-bold">Personal details</h2>
          <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" autoComplete="given-name" {...field("firstName")}/>
            <TextField label="Last name" autoComplete="family-name" {...field("lastName")}/>
            <TextField label="Email" type="email" autoComplete="email" {...field("email")}/>
            <TextField label="Phone (optional)" type="tel" autoComplete="tel" {...field("phone")}/>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Appearance</h2>
            <p className="text-sm text-muted">Current theme: {theme}</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "light" : "dark"} theme
          </Button>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Local data</h2>
            <p className="text-sm text-muted">Removes cart, orders, reviews and wishlist from this browser.</p>
          </div>
          <Button variant="danger" onClick={handleClearData}>
            Clear local data
          </Button>
        </Card>

        <div>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </div>);
}
