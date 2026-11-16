import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
// Route-level code splitting: each page becomes its own chunk, downloaded only when it is opened.
const CatalogPage = lazy(() => import("@/pages/CatalogPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("@/pages/OrderDetailsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const CrashTestPage = lazy(() => import("@/pages/CrashTestPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
export default function AppRoutes() {
    return (<Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />}/>
        <Route path="login" element={<LoginPage />}/>
        <Route path="products/:id" element={<ProductPage />}/>
        <Route path="cart" element={<CartPage />}/>
        <Route path="wishlist" element={<WishlistPage />}/>
        <Route path="compare" element={<ComparePage />}/>
        <Route path="crash-test" element={<CrashTestPage />}/>

        {/* Protected: guests are redirected to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />}/>
          <Route path="orders" element={<OrdersPage />}/>
          <Route path="orders/:id" element={<OrderDetailsPage />}/>
          <Route path="profile" element={<ProfilePage />}/>
        </Route>

        <Route path="*" element={<NotFoundPage />}/>
      </Route>
    </Routes>);
}
