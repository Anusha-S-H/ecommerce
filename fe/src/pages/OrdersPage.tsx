import React from "react";
import { useOrders } from "@/context/OrderContext";
import { toast } from "sonner";
import { Package, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { formatINR } from "@/lib/currency";

const STATUS_CONFIG = {
  PENDING: { icon: Package, label: "Pending Payment", className: "bg-warning/10 text-warning" },
  PAID: { icon: CheckCircle, label: "Paid", className: "bg-success/10 text-success" },
  FAILED: { icon: XCircle, label: "Failed", className: "bg-destructive/10 text-destructive" },
  SHIPPED: { icon: Package, label: "Shipped", className: "bg-primary/10 text-primary" },
  DELIVERED: { icon: CheckCircle, label: "Delivered", className: "bg-success/10 text-success" },
};

export default function OrdersPage() {
  const { orders, simulatePayment } = useOrders();

  const handlePay = async (orderId: string) => {
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    const result = await simulatePayment(orderId, success);
    if (!result.success) {
      toast.error(result.error || "Payment failed. Please try again.");
      return;
    }

    if (success) {
      toast.success("Payment successful!");
    } else {
      toast.error("Payment failed. Please try again.");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto animate-fade-in px-4 py-10">
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center shadow-card">
          <Package className="h-16 w-16 text-muted-foreground/30" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your order timeline will appear here.</p>
          <p className="mt-1 text-xs text-muted-foreground">Once you place an order, you can track payment and status updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fade-in px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Track & Manage</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-foreground">Your Orders</h1>
      </div>

      <div className="mt-8 space-y-6">
        {orders.map((order) => {
          const statusCfg = STATUS_CONFIG[order.status];
          const StatusIcon = statusCfg.icon;
          return (
            <div key={order.id} className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusCfg.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusCfg.label}
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-lg bg-muted/30 p-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product && (
                      <img src={item.product.image_url} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{item.product?.name || item.product_id}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatINR(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display font-semibold text-foreground">Total: {formatINR(order.total_amount)}</span>
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handlePay(order.id)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
