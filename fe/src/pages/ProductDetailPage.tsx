import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/services/productService";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { ArrowLeft, Minus, Plus, ShoppingCart, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { formatINR } from "@/lib/currency";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    let isActive = true;
    getProduct(id)
      .then((response) => {
        if (isActive) setProduct(response);
      })
      .catch((error) => {
        if (error instanceof ApiError && error.statusCode === 404) {
          toast.error("Product not found");
        } else {
          toast.error("Failed to load product");
        }
        navigate("/");
      });

    return () => {
      isActive = false;
    };
  }, [id, navigate]);

  if (!product) return null;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate("/login");
      return;
    }
    const result = await addToCart(product.id, qty);
    if (result.success) {
      toast.success(`${qty}x ${product.name} added to cart`);
    } else {
      toast.error(result.error || "Failed to add to cart");
    }
  };

  return (
    <div className="container mx-auto animate-fade-in px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-card">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Best Seller</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">{product.name}</h1>

          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-muted px-2 py-1 font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </span>
            {product.deal_type && (
              <span className="rounded-full bg-warning/10 px-2 py-1 font-medium uppercase tracking-wide text-warning">
                {product.deal_type} Deal
              </span>
            )}
            {product.is_new_arrival && (
              <span className="rounded-full bg-primary/10 px-2 py-1 font-medium uppercase tracking-wide text-primary">
                Arrival
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 font-medium text-warning">
              <Star className="h-3.5 w-3.5 fill-warning" /> 4.6
            </span>
            <span className="text-muted-foreground">1,248 ratings</span>
          </div>

          <p className="mt-4 font-display text-3xl font-bold text-primary">{formatINR(product.price)}</p>
          <p className="mt-1 text-xs text-success">Inclusive of all taxes · FREE delivery available</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-4 text-sm text-muted-foreground">
            {product.stock > 0 ? (
              <span className="font-medium text-success">In stock ({product.stock} available)</span>
            ) : (
              <span className="font-medium text-destructive">Out of stock</span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border bg-muted/30">
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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>

          <div className="mt-6 grid gap-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Fast delivery in 2-4 days</p>
            <p className="inline-flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> Easy 7-day return policy</p>
            <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure payment with protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
