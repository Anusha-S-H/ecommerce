import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, Gift } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="container mx-auto animate-fade-in px-4 py-10">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="hidden rounded-2xl border border-border bg-gradient-to-br from-accent/30 via-muted to-primary/10 p-8 shadow-card lg:block">
          <p className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">New Account</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground">Create your account and unlock better shopping.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Save your cart, manage orders, and get deal alerts personalized for you.</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Faster checkout experience</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <Gift className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium text-foreground">Exclusive member offers</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 p-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-foreground">Secure and private account</p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join artisan.shop today</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Your name"
              />
            </div>
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
                placeholder="Min 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
