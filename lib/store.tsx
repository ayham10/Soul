"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { products as seed, Product } from "@/lib/products";
import { deletePerfumeImage } from "@/lib/image-upload";
import { slugify } from "@/lib/slug";

interface ProductsContextType {
  products: Product[];
  ready: boolean;
  saving: boolean;
  get: (slug: string) => Product | undefined;
  add: (p: Product) => Promise<void>;
  update: (slug: string, p: Product) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  reset: () => Promise<void>;
  reload: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);
const STORAGE_KEY = "soul-catalog-v1";

export { slugify };

async function fetchCatalog(): Promise<{ products: Product[]; storage: string }> {
  const response = await fetch("/api/products", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load product catalogue");
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error("Invalid catalogue response");
  return { products: data.products as Product[], storage: data.storage ?? "unknown" };
}

async function saveCatalog(products: Product[]): Promise<{ products: Product[]; storage: string }> {
  const response = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Unable to save product catalogue");
  }
  if (!Array.isArray(data.products)) {
    throw new Error("Invalid save response from server");
  }
  return { products: data.products as Product[], storage: data.storage ?? "unknown" };
}

function cacheCatalog(products: Product[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch {}
}

function readCachedCatalog(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(seed);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const applyCatalog = useCallback((products: Product[]) => {
    setItems(products);
    cacheCatalog(products);
  }, []);

  const reload = useCallback(async () => {
    const { products, storage } = await fetchCatalog();
    if (storage === "filesystem") {
      const cached = readCachedCatalog();
      if (cached) {
        applyCatalog(cached);
        return;
      }
    }
    applyCatalog(products);
  }, [applyCatalog]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { products, storage } = await fetchCatalog();
        if (!active) return;
        if (storage === "filesystem") {
          const cached = readCachedCatalog();
          applyCatalog(cached ?? products);
        } else {
          applyCatalog(products);
        }
      } catch {
        if (!active) return;
        const cached = readCachedCatalog();
        if (cached) applyCatalog(cached);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, [applyCatalog]);

  const persist = useCallback(async (next: Product[]) => {
    setSaving(true);
    try {
      const { products: saved } = await saveCatalog(next);
      applyCatalog(saved);
    } finally {
      setSaving(false);
    }
  }, [applyCatalog]);

  const add = useCallback(async (p: Product) => {
    const prev = itemsRef.current;
    let slug = p.slug || slugify(p.name);
    const existing = new Set(prev.map((x) => x.slug));
    let i = 2;
    const baseSlug = slug;
    while (existing.has(slug)) slug = `${baseSlug}-${i++}`;
    const next = [{ ...p, slug }, ...prev];
    setItems(next);
    try {
      await persist(next);
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const update = useCallback(async (slug: string, p: Product) => {
    const prev = itemsRef.current;
    const next = prev.map((x) => (x.slug === slug ? { ...p, slug } : x));
    setItems(next);
    try {
      await persist(next);
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const remove = useCallback(async (slug: string) => {
    const prev = itemsRef.current;
    const removed = prev.find((x) => x.slug === slug);
    const next = prev.filter((x) => x.slug !== slug);
    setItems(next);
    try {
      await persist(next);
      if (removed?.image) {
        deletePerfumeImage(removed.image).catch(console.error);
      }
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const reset = useCallback(async () => {
    setSaving(true);
    try {
      const { products: saved } = await saveCatalog(seed);
      applyCatalog(saved);
    } finally {
      setSaving(false);
    }
  }, [applyCatalog]);

  const get = useCallback((slug: string) => items.find((p) => p.slug === slug), [items]);

  const value = useMemo(
    () => ({ products: items, ready, saving, get, add, update, remove, reset, reload }),
    [items, ready, saving, get, add, update, remove, reset, reload]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
