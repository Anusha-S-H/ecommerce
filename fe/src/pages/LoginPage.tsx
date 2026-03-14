import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, Truck, BadgePercent } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="container mx-auto animate-fade-in px-4 py-10">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-accent/30 to-muted p-8 shadow-card lg:block">
          <p className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Welcome Back</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground">Sign in to continue shopping smarter.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Track orders, save favorites, and checkout faster with a secure account.</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-foreground">Secure account & encrypted checkout</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <Truck className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Fast delivery and easy order tracking</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <BadgePercent className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium text-foreground">Exclusive member-only deals</p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to artisan.shop</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium">Demo credentials:</p>
            <p>Admin: admin@store.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
