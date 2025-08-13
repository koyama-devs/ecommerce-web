import { Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import HomePage from "../pages/HomePage";
import ProductListPage from "../pages/ProductListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage"; 
import NotFound from "../pages/NotFound";

export default function AppRoutes() { 
    return (
        <Routes>
            <Route path="/" element={<Layout />}>       
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes> 
    );
}


