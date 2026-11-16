import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "../components/layout/Layout.jsx";
import { ProtectedRoute } from "../components/common/ProtectedRoute.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
// Route-level code splitting using React.lazy (PRD O1)
const CatalogPage = lazy(() => import("../pages/CatalogPage.jsx"));
const ProductPage = lazy(() => import("../pages/ProductPage.jsx"));
const CartPage = lazy(() => import("../pages/CartPage.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage.jsx"));
const OrdersPage = lazy(() => import("../pages/OrdersPage.jsx"));
const OrderDetailPage = lazy(() => import("../pages/OrderDetailPage.jsx"));
const ProfilePage = lazy(() => import("../pages/ProfilePage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));
function PageLoader() {
    return (<div className="min-h-[50vh] flex items-center justify-center">
      <Spinner size="lg" label="Loading page..."/>
    </div>);
}
export function AppRoutes() {
    return (<Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Suspense fallback={<PageLoader />}>
              <CatalogPage />
            </Suspense>}/>
        <Route path="login" element={<Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>}/>
        <Route path="products/:id" element={<Suspense fallback={<PageLoader />}>
              <ProductPage />
            </Suspense>}/>
        <Route path="cart" element={<Suspense fallback={<PageLoader />}>
              <CartPage />
            </Suspense>}/>

        {/* Protected Routes */}
        <Route path="checkout" element={<ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <CheckoutPage />
              </Suspense>
            </ProtectedRoute>}/>
        <Route path="orders" element={<ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OrdersPage />
              </Suspense>
            </ProtectedRoute>}/>
        <Route path="orders/:id" element={<ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <OrderDetailPage />
              </Suspense>
            </ProtectedRoute>}/>
        <Route path="profile" element={<ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>}/>

        {/* 404 Route */}
        <Route path="*" element={<Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>}/>
      </Route>
    </Routes>);
}
