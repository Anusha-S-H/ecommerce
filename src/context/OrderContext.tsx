import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Order, OrderItem } from "@/types";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { MOCK_PRODUCTS } from "@/data/products";

interface OrderContextType {
  orders: Order[];
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  simulatePayment: (orderId: string, success: boolean) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function getOrdersKey(userId: string) {
  return `ecom_orders_${userId}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const raw = localStorage.getItem(getOrdersKey(user.id));
      setOrders(raw ? JSON.parse(raw) : []);
    } else {
      setOrders([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(getOrdersKey(user.id), JSON.stringify(orders));
    }
  }, [orders, user]);

  const placeOrder = useCallback(async () => {
    if (!user) return { success: false, error: "Not authenticated" };
    if (items.length === 0) return { success: false, error: "Cart is empty" };

    const orderId = "ord_" + Date.now();
    const orderItems: OrderItem[] = items.map((item) => ({
      id: "oi_" + Date.now() + "_" + item.product_id,
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price ?? 0,
      product: item.product,
    }));

    const order: Order = {
      id: orderId,
      user_id: user.id,
      total_amount: total,
      status: "PENDING",
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    setOrders((prev) => {
      const updated = [order, ...prev];
      localStorage.setItem(getOrdersKey(user.id), JSON.stringify(updated));
      return updated;
    });
    clearCart();
    return { success: true, orderId };
  }, [user, items, total, clearCart]);

  const simulatePayment = useCallback((orderId: string, success: boolean) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status: success ? "PAID" as const : "FAILED" as const } : o
      );
      if (user) localStorage.setItem(getOrdersKey(user.id), JSON.stringify(updated));
      return updated;
    });
  }, [user]);

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
