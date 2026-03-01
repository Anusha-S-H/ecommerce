import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/services/productService";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const p = getProduct(id);
      if (p) setProduct(p);
      else navigate("/");
    }
  }, [id, navigate]);

  if (!product) return null;

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate("/login");
      return;
    }
    addToCart(product.id, qty);
    toast.success(`${qty}x ${product.name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-muted">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="mt-2 font-display text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-2 text-sm text-muted-foreground">
            {product.stock > 0 ? (
              <span className="text-success font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium text-foreground">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
