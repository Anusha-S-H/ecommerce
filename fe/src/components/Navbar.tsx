import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchText, setSearchText] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-foreground text-background shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            artisan<span className="text-primary">.shop</span>
          </Link>

          <div className="hidden flex-1 items-center md:flex">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="flex w-full items-center gap-2 rounded-lg border border-background/20 glass-surface px-3 py-1.5">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for products, brands and more"
                  className="w-full bg-transparent px-1 py-1 text-sm text-background placeholder:text-background/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-background/20 px-3 py-1.5 md:flex">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Link
                  to="/cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-background/10"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="flex h-11 items-center gap-5 border-t border-background/15 text-sm">
          <Link to="/" className="inline-flex items-center gap-2 font-medium hover:text-primary">
            <Menu className="h-4 w-4" /> All
          </Link>
          <Link to="/?deal=LIGHTNING" className="font-medium hover:text-primary">Today's Deals</Link>
          <Link to="/?category=arrivals" className="font-medium hover:text-primary">Arrivals</Link>
          {isAuthenticated && <Link to="/orders" className="font-medium hover:text-primary">Orders</Link>}
          {user?.role === "admin" && <Link to="/admin" className="font-medium hover:text-primary">Admin</Link>}
          <span className="ml-auto hidden items-center gap-1 text-background/80 md:inline-flex">
            <Package className="h-4 w-4" /> Fast Delivery Available
          </span>
        </div>
      </div>
    </nav>
  );
}
