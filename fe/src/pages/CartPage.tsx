import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/currency";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update cart item";
      toast.error(message);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove cart item";
      toast.error(message);
    }
  };

  const handleCheckout = async () => {
    const result = await placeOrder();
    if (result.success) {
      toast.success("Order placed! Proceed to payment.");
      navigate(`/orders`);
    } else {
      toast.error(result.error || "Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto animate-fade-in px-4 py-10">
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center shadow-card">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">Looks like you haven’t added anything yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Explore top picks and deals to get started.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fade-in px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your Shopping Cart</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
          Review your items <span className="text-muted-foreground text-xl">({itemCount})</span>
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
              <img
                src={item.product?.image_url}
                alt={item.product?.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex flex-1 flex-col">
                <h3 className="font-display text-base font-semibold text-card-foreground">{item.product?.name}</h3>
                <p className="text-sm font-semibold text-primary">{formatINR(item.product?.price || 0)}</p>
                <p className="text-xs text-success">Eligible for FREE shipping</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border bg-muted/30">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-card-foreground">Order Summary</h3>
          <p className="mt-1 text-xs text-muted-foreground">Items and delivery estimate</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-success">Free</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Tax</span>
              <span>{formatINR(total * 0.05)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-display font-semibold text-foreground">
              <span>Total</span>
              <span>{formatINR(total + total * 0.05)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Place Order
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout powered by JWT auth</p>
        </div>
      </div>
    </div>
  );
}
