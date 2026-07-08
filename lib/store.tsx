"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { products as seed, Product } from "@/lib/products";
import { deletePerfumeImage } from "@/lib/image-upload";

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
  const data = await response.json().catch(() => null);
  return (data?.storage as string) ?? "unknown";
}

function warnSharedSaveFailed(error: unknown, storage?: string) {
  console.error(error);
  if (typeof window === "undefined") return;
  if (storage === "filesystem") {
    const onLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!onLocalhost) {
      window.alert(
        "Changes are saved on this device only. To sync admin edits across every phone and browser, add SUPABASE_URL and SUPABASE_SECRET_KEY to your deployment (see .env.example)."
      );
    }
    return;
  }
  window.alert(
    "Could not save the catalogue. Check your connection and Supabase environment variables."
  );
}

import { slugify } from "@/lib/slug";

export { slugify };

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      let localProducts: Product[] | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) localProducts = parsed;
        }
      } catch {}

      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (!active) return;

          const apiProducts = Array.isArray(data.products) ? data.products : null;
          const storage = data.storage as string | undefined;

          // Without Supabase/Redis the server may reset to seed on each deploy — prefer this device's saved catalogue.
          if (storage === "filesystem" && localProducts) {
            setItems(localProducts);
          } else if (apiProducts?.length) {
            setItems(apiProducts);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apiProducts)); } catch {}
          } else if (localProducts) {
            setItems(localProducts);
          }
        } else {
          throw new Error("Catalogue request failed");
        }
      } catch {
        if (active && localProducts) setItems(localProducts);
      } finally {
        if (active) setReady(true);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const persist = useCallback((next: Product[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    saveSharedCatalog(next)
      .catch((err) => warnSharedSaveFailed(err));
    return next;
  }, []);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      let slug = p.slug || slugify(p.name);
      const existing = new Set(prev.map((x) => x.slug));
      let i = 2;
      const baseSlug = slug;
      while (existing.has(slug)) slug = `${baseSlug}-${i++}`;
      const next = [{ ...p, slug }, ...prev];
      persist(next);
      return next;
    });
  }, [persist]);

  const update = useCallback((slug: string, p: Product) => {
    setItems((prev) => {
      const next = prev.map((x) => (x.slug === slug ? { ...p, slug } : x));
      persist(next);
      return next;
    });
  }, [persist]);

  const remove = useCallback((slug: string) => {
    setItems((prev) => {
      const removed = prev.find((x) => x.slug === slug);
      if (removed?.image) {
        deletePerfumeImage(removed.image).catch(console.error);
      }
      const next = prev.filter((x) => x.slug !== slug);
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    saveSharedCatalog(seed).catch((err) => warnSharedSaveFailed(err));
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
