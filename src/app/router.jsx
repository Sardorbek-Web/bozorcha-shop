import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import ProductPage from "../pages/ProductPage";
import CheckoutPage from "../pages/CheckoutPage";
import CartPage from "../pages/CartPage";
import FavoritesPage from "../pages/FavoritesPage";
import OrdersPage from "../pages/OrdersPage";
import ProfilePage from "../pages/ProfilePage";

import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminProductsPage from "../pages/AdminProductsPage";
import AdminAddProductPage from "../pages/AdminAddProductPage";
import AdminEditProductPage from "../pages/AdminEditProductPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import AdminOrderDetailPage from "../pages/AdminOrderDetailPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import AdminSettingsPage from "../pages/AdminSettingsPage";

import AdminRoute from "../components/auth/AdminRoute";

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />


            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboardPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/settings"
                element={
                    <AdminRoute>
                        <AdminSettingsPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/orders/:id"
                element={
                    <AdminRoute>
                        <AdminOrderDetailPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/products"
                element={
                    <AdminRoute>
                        <AdminProductsPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/products/new"
                element={
                    <AdminRoute>
                        <AdminAddProductPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/products/edit/:id"
                element={
                    <AdminRoute>
                        <AdminEditProductPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/orders"
                element={
                    <AdminRoute>
                        <AdminOrdersPage />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}