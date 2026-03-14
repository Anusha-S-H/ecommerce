// Types for the e-commerce application

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: "electronics" | "home" | "office" | "kitchen" | "accessories" | "arrivals";
  deal_type: "LIGHTNING" | "BANK" | "COUPON" | null;
  is_new_arrival: boolean;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "SHIPPED" | "DELIVERED";
  created_at: string;
  items: OrderItem[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
