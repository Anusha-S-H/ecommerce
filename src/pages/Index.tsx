import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/services/productService";
import { Product } from "@/types";
import { Search } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="border-b border-border bg-muted/50 px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Curated Essentials
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Thoughtfully designed objects for your everyday life. Quality materials, honest craftsmanship.
          </p>
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-card">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            All Products <span className="text-muted-foreground">({filtered.length})</span>
          </h2>
        </div>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No products found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
