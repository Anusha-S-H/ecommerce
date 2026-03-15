import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { formatINR } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const pseudoRating = (4 + (product.name.length % 10) / 10).toFixed(1);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    const result = await addToCart(product.id);
    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.error || "Failed to add to cart");
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="aspect-square overflow-hidden bg-muted/70">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-card-foreground">{product.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
          {product.is_new_arrival && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium uppercase tracking-wide text-primary">
              arrival
            </span>
          )}
          {product.deal_type && (
            <span className="rounded-full bg-warning/10 px-2 py-0.5 font-medium uppercase tracking-wide text-warning">
              {product.deal_type} deal
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-medium text-foreground">{pseudoRating}</span>
          <span>•</span>
          <span>1k+ bought</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-4 space-y-1">
          <span className="font-display text-xl font-bold text-foreground">{formatINR(product.price)}</span>
          <p className="text-xs text-success">FREE delivery by tomorrow</p>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
        {product.stock <= 5 && (
          <span className="mt-2 text-xs font-medium text-destructive">Only {product.stock} left in stock</span>
        )}
      </div>
    </Link>
  );
}
