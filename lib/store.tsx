"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products as seed, Product } from "@/lib/products";

interface ProductsContextType {
  products: Product[];
  ready: boolean;
  get: (slug: string) => Product | undefined;
  add: (p: Product) => void;
  update: (slug: string, p: Product) => void;
  remove: (slug: string) => void;
  reset: () => void;
}

const ProductsContext = createContext<ProductsContextType | null>(null);
const STORAGE_KEY = "soul-catalog-v1";

async function saveSharedCatalog(products: Product[]) {
  const response = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products }),
  });
  if (!response.ok) throw new Error("Unable to save product catalogue");
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "fragrance"
  );
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (active && Array.isArray(data.products) && data.products.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setItems(data.products);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products)); } catch {}
          }
        } else {
          throw new Error("Catalogue request failed");
        }
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (active && Array.isArray(parsed) && parsed.length) {
              // eslint-disable-next-line react-hooks/set-state-in-effect
              setItems(parsed);
            }
          }
        } catch {}
      } finally {
        if (active) setReady(true);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      let slug = p.slug || slugify(p.name);
      const existing = new Set(prev.map((x) => x.slug));
      let i = 2;
      const baseSlug = slug;
      while (existing.has(slug)) slug = `${baseSlug}-${i++}`;
      const next = [{ ...p, slug }, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      saveSharedCatalog(next).catch(() => {});
      return next;
    });
  }, []);

  const update = useCallback((slug: string, p: Product) => {
    setItems((prev) => {
      const next = prev.map((x) => (x.slug === slug ? { ...p, slug } : x));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      saveSharedCatalog(next).catch(() => {});
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.slug !== slug);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      saveSharedCatalog(next).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    saveSharedCatalog(seed).catch(() => {});
    setItems(seed);
  }, []);

  const get = useCallback((slug: string) => items.find((p) => p.slug === slug), [items]);

  const value = useMemo(
    () => ({ products: items, ready, get, add, update, remove, reset }),
    [items, ready, get, add, update, remove, reset]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
