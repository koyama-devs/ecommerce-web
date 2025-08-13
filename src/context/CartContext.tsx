import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';

type CartItem = {
    product: Product;   
    quantity: number;
};

interface CartContextType  {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    increaseQty: (productId: number) => void;
    decreaseQty: (productId: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(
        () => {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        }
    );

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems((prevItems: CartItem[]) => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems((prevItems: CartItem[]) => prevItems.filter(item => item.product.id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const increaseQty = (productId: number) => {  
        setCartItems((prevItems: CartItem[]) =>
            prevItems.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }
    const decreaseQty = (productId: number) => {
        setCartItems((prevItems: CartItem[]) =>
            prevItems.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
                    : item
            )
        );
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, increaseQty, decreaseQty }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};

