import { Product } from "@/types";
import { api } from "@/lib/api";

type ProductPayload = Omit<Product, "created_at"> & Partial<Pick<Product, "created_at">>;
type ProductQuery = {
  search?: string;
  category?: string;
  deal_type?: "LIGHTNING" | "BANK" | "COUPON";
  new_arrival?: boolean;
};

export async function getProducts(filters?: ProductQuery): Promise<Product[]> {
  const query = new URLSearchParams();
  if (filters?.search) query.set("search", filters.search);
  if (filters?.category) query.set("category", filters.category);
  if (filters?.deal_type) query.set("deal_type", filters.deal_type);
  if (filters?.new_arrival !== undefined) query.set("new_arrival", String(filters.new_arrival));
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return api.get<Product[]>(`/products${suffix}`);
}

export async function getProduct(id: string): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
}

export async function saveProduct(product: ProductPayload): Promise<Product> {
  if (product.id) {
    return api.put<Product>(`/products/${product.id}`, product);
  }

  const { id: _, ...createPayload } = product;
  return api.post<Product>("/products", createPayload);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete<void>(`/products/${id}`);
}
