import { Routes, Route } from 'react-router';
import Catalog from "../pages/Catalog.jsx";
import Login from "../pages/login.jsx";
import Cart from "../pages/cart.jsx";
import Product from "../pages/product.jsx";
import Checkout from "../pages/checkout.jsx";
import NotFound from "../pages/notFound.jsx";
import Profile from "../pages/profile.jsx";
import Layout from "../components/layout/Layout.jsx";
import ProtectedRoute from './ProtectedRoute.jsx';
function AppRoutes() {
    return (<>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Catalog />}/>
                    <Route path="/login" element={<Login />}/>
                    <Route path="/cart" element={<Cart />}/>
                    <Route path="/products/:id" element={<Product />}/>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/checkout" element={<Checkout />}/>
                    </Route>
                    <Route path="/profile" element={<Profile />}/>
                </Route>
                <Route path="*" element={<NotFound />}/>
            </Routes>
        </>);
}
export default AppRoutes;
