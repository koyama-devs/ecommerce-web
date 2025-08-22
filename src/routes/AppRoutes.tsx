import { Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import CartPage from "../pages/CartPage";
import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ProductListPage from "../pages/ProductListPage";

export default function AppRoutes() { 
    return (
        <Routes>
            <Route path="/" element={<Layout />}>       
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="/order-success/:invoiceId" element={<OrderSuccessPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes> 
    );
}


