import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/services/productService";
import { Product } from "@/types";
import { Search, ShieldCheck, Truck, RotateCcw, BadgePercent } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const selectedCategory = searchParams.get("category") || "";
  const selectedDeal = searchParams.get("deal") || "";

  useEffect(() => {
    let isActive = true;

    const q = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const deal = (searchParams.get("deal") as "LIGHTNING" | "BANK" | "COUPON" | null) || undefined;

    getProducts({
      search: q,
      category,
      deal_type: deal,
    })
      .then((data) => {
        if (isActive) setProducts(data);
      })
      .catch(() => {
        toast.error("Failed to load products");
      });

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
  }, [searchParams]);

  const highlights = [
    { icon: Truck, label: "Free shipping", detail: "on all prepaid orders" },
    { icon: RotateCcw, label: "Easy returns", detail: "within 7 days" },
    { icon: ShieldCheck, label: "Secure checkout", detail: "100% protected" },
    { icon: BadgePercent, label: "Daily deals", detail: "limited-time offers" },
  ];

  const categories: Array<{ label: string; value: string }> = [
    { label: "Electronics", value: "electronics" },
    { label: "Home", value: "home" },
    { label: "Office", value: "office" },
    { label: "Kitchen", value: "kitchen" },
    { label: "Accessories", value: "accessories" },
    { label: "Arrivals", value: "arrivals" },
  ];

  const applySearch = (value: string) => {
    setSearch(value);
    const trimmed = value.trim();
    const params = new URLSearchParams(searchParams);
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  const applyCategory = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", category);
    setSearchParams(params);
  };

  const applyDeal = (deal: "LIGHTNING" | "BANK" | "COUPON") => {
    const params = new URLSearchParams(searchParams);
    params.set("deal", deal);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="animate-fade-in pb-10">
      <section className="border-b border-border bg-gradient-to-r from-muted to-accent/50 px-4 py-10 md:py-12">
        <div className="container mx-auto">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                MEGA SALE LIVE NOW
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Everything you need, in one smart marketplace.
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                Discover curated daily-use products with fast delivery, safe checkout, and unbeatable value.
              </p>
              <div className="mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for lamps, mugs, notebooks..."
                  value={search}
                  onChange={(e) => applySearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category.value}
              onClick={() => applyCategory(category.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedCategory === category.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {category.label}
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-border bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">Fresh picks based on what shoppers love</p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{products.length} items</p>
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-border bg-card py-12 text-center text-muted-foreground shadow-card">
            No products found.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pt-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold text-foreground">Deals of the day</h3>
          <p className="mt-1 text-sm text-muted-foreground">Save up to 40% on selected products — limited stock.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <button
              type="button"
              onClick={() => applyDeal("LIGHTNING")}
              className={`rounded-md px-2.5 py-1 font-medium ${
                selectedDeal === "LIGHTNING" ? "bg-success text-success-foreground" : "bg-success/10 text-success"
              }`}
            >
              Lightning Deals
            </button>
            <button
              type="button"
              onClick={() => applyDeal("BANK")}
              className={`rounded-md px-2.5 py-1 font-medium ${
                selectedDeal === "BANK" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              }`}
            >
              Bank Offers
            </button>
            <button
              type="button"
              onClick={() => applyDeal("COUPON")}
              className={`rounded-md px-2.5 py-1 font-medium ${
                selectedDeal === "COUPON" ? "bg-warning text-warning-foreground" : "bg-warning/10 text-warning"
              }`}
            >
              New Coupons
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">New deals are refreshed every hour.</p>
        </div>
      </section>
    </div>
  );
}
