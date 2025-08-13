export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tag?: ("best-seller" | "new" | "sale")[];
}

const products: Product[] = [
  { id: 1, name: "Product 1", description: "Description of Product 1", price: 100, imageUrl: "https://placehold.co/150x150", category: "Clothing", tag: ["best-seller"] },
  { id: 2, name: "Product 2", description: "Description of Product 2", price: 200, imageUrl: "https://placehold.co/150x150", category: "Clothing", tag: ["best-seller", "sale"] },
  { id: 3, name: "Product 3", description: "Description of Product 3", price: 300, imageUrl: "https://placehold.co/150x150", category: "Electronics", tag: ["new"] },
  { id: 4, name: "Product 4", description: "Description of Product 4", price: 700, imageUrl: "https://placehold.co/150x150", category: "Electronics" },
  { id: 5, name: "Product 5", description: "Description of Product 5", price: 650, imageUrl: "https://placehold.co/150x150", category: "Clothing", tag: ["best-seller"] },
  { id: 6, name: "Product 6", description: "Description of Product 6", price: 450, imageUrl: "https://placehold.co/150x150", category: "Accessories" },
  { id: 7, name: "Product 7", description: "Description of Product 7", price: 200, imageUrl: "https://placehold.co/150x150", category: "Accessories", tag: ["new"] },
  { id: 8, name: "Product 8", description: "Description of Product 8", price: 800, imageUrl: "https://placehold.co/150x150", category: "Electronics", tag: ["sale"] },
  { id: 9, name: "Product 9", description: "Description of Product 9", price: 900, imageUrl: "https://placehold.co/150x150", category: "Electronics" },
  { id: 10, name: "Product 10", description: "Description of Product 10", price: 1000, imageUrl: "https://placehold.co/150x150", category: "Clothing", tag: ["best-seller"] },
  { id: 11, name: "Product 11", description: "Description of Product 11", price: 1100, imageUrl: "https://placehold.co/150x150", category: "Accessories", tag: ["sale"] },
  { id: 12, name: "Product 12", description: "Description of Product 12", price: 1200, imageUrl: "https://placehold.co/150x150", category: "Accessories" },
  { id: 13, name: "Product 13", description: "Description of Product 13", price: 1300, imageUrl: "https://placehold.co/150x150", category: "Clothing", tag: ["new"] },
  { id: 14, name: "Product 14", description: "Description of Product 14", price: 1400, imageUrl: "https://placehold.co/150x150", category: "Clothing" },
];

export const getProductById = (id: number): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getAllProducts = (): Product[] => {
  return products;
};

export const getProductsByPriceRange = (min: number, max: number): Product[] => {
  return products.filter((product) => product.price >= min && product.price <= max);
};

export const getProductsBySearchTerm = (searchTerm: string): Product[] => {
  return products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// ✅ Sản phẩm nổi bật: chọn 4 đầu tiên (hoặc có thể random)
export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 4);
};

export const getBestSellerProducts = (): Product[] => {
  return products.filter((product) => product.tag?.includes("best-seller"));
};

export const getNewProducts = (): Product[] => {
  return products.filter((product) => product.tag?.includes("new"));
};

export const getSaleProducts = (): Product[] => {
  return products.filter((product) => product.tag?.includes("sale"));
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(products.map((product) => product.category)));
};
