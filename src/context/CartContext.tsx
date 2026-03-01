import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/products";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(userId: string) {
  return `ecom_cart_${userId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) {
      const raw = localStorage.getItem(getCartKey(user.id));
      setItems(raw ? JSON.parse(raw) : []);
    } else {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getCartKey(user.id), JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      if (existing) {
        return prev.map((i) => i.product_id === productId ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { id: "ci_" + Date.now(), cart_id: "cart", product_id: productId, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const enrichedItems = items.map((i) => ({
    ...i,
    product: MOCK_PRODUCTS.find((p) => p.id === i.product_id),
  }));

  const total = enrichedItems.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: enrichedItems, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
