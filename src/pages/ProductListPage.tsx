import { useState } from "react";
import ProductCard from "../components/ProductCard";
import {
    getAllProducts,
    getAllCategories,
    getProductsByCategory,
} from "../data/products";
import type { Product } from "../data/products";
import { useTranslation } from "react-i18next";
import CategorySidebar from "../components/CategorySidebar"; // 👈 import mới

export default function ProductListPage() {
    const { t } = useTranslation();
    const categories = getAllCategories();
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const products: Product[] =
        selectedCategory === ""
            ? getAllProducts()
            : getProductsByCategory(selectedCategory);

    return (
        <div style={{ display: "flex", gap: "24px", padding: "20px" }}>
            {/* ✅ Sidebar tách riêng */}
            <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            {/* ✅ Danh sách sản phẩm */}
            <main style={{ flex: 1 }}>
                <h2 style={{ marginBottom: "20px" }}>{t("productList.title")}</h2>
                <div
                    className="product-list"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "40px",
                        justifyContent: "center",
                    }}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
        </div>
    );
}
