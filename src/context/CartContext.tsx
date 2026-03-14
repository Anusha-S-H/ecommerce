import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Cart, CartItem } from "@/types";
import { useAuth } from "./AuthContext";
import { api, ApiError } from "@/lib/api";

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, qty?: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let isActive = true;
    api
      .get<Cart>("/cart")
      .then((cart) => {
        if (isActive) setItems(cart.items || []);
      })
      .catch(() => {
        if (isActive) setItems([]);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const addToCart = useCallback(async (productId: string, qty = 1) => {
    try {
      const cart = await api.post<Cart>("/cart/items", {
        product_id: productId,
        quantity: qty,
      });
      setItems(cart.items || []);
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Failed to add item to cart" };
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    await api.delete<void>(`/cart/items/${itemId}`);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      const cart = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
      setItems(cart.items || []);
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    await api.delete<void>("/cart/clear");
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
