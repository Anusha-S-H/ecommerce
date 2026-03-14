import React, { useState, useEffect } from "react";
import { getProducts, saveProduct, deleteProduct } from "@/services/productService";
import { Product } from "@/types";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Package, IndianRupee } from "lucide-react";
import { formatINR } from "@/lib/currency";

const CATEGORY_OPTIONS: Product["category"][] = ["electronics", "home", "office", "kitchen", "accessories", "arrivals"];
const DEAL_OPTIONS: Array<NonNullable<Product["deal_type"]>> = ["LIGHTNING", "BANK", "COUPON"];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let isActive = true;
    getProducts()
      .then((data) => {
        if (isActive) setProducts(data);
      })
      .catch(() => {
        toast.error("Failed to load products");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const blankProduct: Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "electronics",
    deal_type: null,
    is_new_arrival: false,
    image_url: "",
    created_at: new Date().toISOString(),
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      await saveProduct(editing);
      const refreshed = await getProducts();
      setProducts(refreshed);
      setShowForm(false);
      setEditing(null);
      toast.success(editing.id ? "Product updated" : "Product added");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save product";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto animate-fade-in px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Store Management</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
          <button
            onClick={() => { setEditing(blankProduct); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Total Products</p>
          <div className="mt-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <p className="text-xl font-bold text-foreground">{products.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Total Inventory</p>
          <p className="mt-2 text-xl font-bold text-foreground">
            {products.reduce((sum, product) => sum + product.stock, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Catalog Value</p>
          <div className="mt-2 flex items-center gap-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <p className="text-xl font-bold text-foreground">
              {formatINR(products.reduce((sum, product) => sum + product.price * product.stock, 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Product Catalog</h2>
        <button
          onClick={() => { setEditing(blankProduct); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Quick Add
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-card-foreground">
                {editing.id ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                placeholder="Product name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <textarea
                placeholder="Description"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={editing.price || ""}
                  onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={editing.stock || ""}
                  onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as Product["category"] })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  value={editing.deal_type || ""}
                  onChange={(e) => setEditing({ ...editing, deal_type: (e.target.value || null) as Product["deal_type"] })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">No Deal</option>
                  {DEAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={editing.is_new_arrival}
                  onChange={(e) => setEditing({ ...editing, is_new_arrival: e.target.checked })}
                />
                Mark as new arrival
              </label>
              <input
                placeholder="Image URL"
                value={editing.image_url}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {editing.id ? "Update" : "Create"} Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/70">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="bg-card hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium text-card-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{formatINR(p.price)}</td>
                <td className="px-4 py-3 text-foreground">
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase">{p.category}</span>
                    {p.deal_type && <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{p.deal_type}</span>}
                    {p.is_new_arrival && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Arrival</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditing(p); setShowForm(true); }}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
