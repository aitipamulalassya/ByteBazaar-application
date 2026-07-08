import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ProductViewer } from "@/components/ProductViewer";
import { Loader } from "@/components/Loader";
import { useProducts } from "@/context/ProductContext";
import type { Product } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ByteBazaar — Marketplace" },
      { name: "description", content: "Browse digital products published by indie creators." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const { products, loading } = useProducts();
  const [viewing, setViewing] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-surface relative overflow-hidden border-b border-border/60">
        <div className="bg-gradient-brand absolute -top-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="border-border bg-background/60 text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            Fresh drops every day
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            The marketplace for{" "}
            <span className="text-gradient-brand">digital creators</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance text-base sm:text-lg">
            UI kits, templates, ebooks, beats, and more — published by makers, opened in a click.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {loading ? (
          <Loader label="Loading products..." />
        ) : products.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
             <ProductCard
  key={p.id}
  product={p}
  onOpen={(product) => {
    console.log("Clicked Product:", product);
    setViewing(product);
  }}
/>
            ))}
          </div>
        )}
      </main>

      <ProductViewer product={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
