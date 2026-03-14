import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Order } from "@/types";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { api, ApiError } from "@/lib/api";

interface OrderContextType {
  orders: Order[];
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  simulatePayment: (orderId: string, success: boolean) => Promise<{ success: boolean; error?: string }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let isActive = true;
    api
      .get<Order[]>("/orders")
      .then((response) => {
        if (isActive) setOrders(response);
      })
      .catch(() => {
        if (isActive) setOrders([]);
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  const placeOrder = useCallback(async () => {
    try {
      const newOrder = await api.post<Order>("/orders");
      setOrders((prev) => [newOrder, ...prev]);
      await clearCart();
      return { success: true, orderId: newOrder.id };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Failed to place order" };
    }
  }, [clearCart]);

  const simulatePayment = useCallback(async (orderId: string, success: boolean) => {
    try {
      const updatedOrder = await api.patch<Order>(`/orders/${orderId}/pay`, { success });
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Payment update failed" };
    }
  }, []);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, simulatePayment }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
