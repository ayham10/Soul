"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { products as seed, Product } from "@/lib/products";
import { assertCanRemoveFromCatalog } from "@/lib/catalog-remove";
import { prepareCatalog, swapDisplayOrder, reorderBySlugs } from "@/lib/inventory";
import { slugify } from "@/lib/slug";

interface ProductsContextType {
  products: Product[];
  ready: boolean;
  saving: boolean;
  get: (slug: string) => Product | undefined;
  add: (p: Product) => Promise<void>;
  update: (slug: string, p: Product) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  restoreToBaseline: () => Promise<{ ok?: boolean; productCount?: number; baselineVersion?: string }>;
  reload: () => Promise<void>;
  moveProduct: (slug: string, direction: "up" | "down") => Promise<void>;
  reorderProducts: (orderedSlugs: string[]) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);
const STORAGE_KEY = "soul-catalog-v1";

export { slugify };

async function fetchCatalog(): Promise<{ products: Product[]; storage: string }> {
  const response = await fetch("/api/products", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load product catalogue");
  const data = await response.json();
  if (!Array.isArray(data.products)) throw new Error("Invalid catalogue response");
  return { products: prepareCatalog(data.products as Product[]), storage: data.storage ?? "unknown" };
}

async function saveCatalog(products: Product[]): Promise<{ products: Product[]; storage: string }> {
  const response = await fetch("/api/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ products: prepareCatalog(products) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Unable to save product catalogue");
  }
  if (!Array.isArray(data.products)) {
    throw new Error("Invalid save response from server");
  }
  return { products: prepareCatalog(data.products as Product[]), storage: data.storage ?? "unknown" };
}

function cacheCatalog(products: Product[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch {}
}

function readCachedCatalog(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? prepareCatalog(parsed as Product[]) : null;
  } catch {
    return null;
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const applyCatalog = useCallback((products: Product[]) => {
    const ordered = prepareCatalog(products);
    setItems(ordered);
    cacheCatalog(ordered);
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
        applyCatalog(cached ?? prepareCatalog(seed));
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
    const next = prepareCatalog([...prev, { ...p, slug }]);
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
    const next = prepareCatalog(prev.map((x) => (x.slug === slug ? { ...p, slug } : x)));
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
    assertCanRemoveFromCatalog(prev.length);
    const next = prepareCatalog(prev.filter((x) => x.slug !== slug));
    setItems(next);
    try {
      await persist(next);
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const restoreToBaseline = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/baseline-restore", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Unable to restore catalogue baseline");
      }
      await reload();
      return data as { ok?: boolean; productCount?: number; baselineVersion?: string };
    } finally {
      setSaving(false);
    }
  }, [reload]);

  const moveProduct = useCallback(async (slug: string, direction: "up" | "down") => {
    const prev = itemsRef.current;
    const next = swapDisplayOrder(prev, slug, direction);
    if (next === prev) return;
    setItems(next);
    try {
      await persist(next);
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const reorderProducts = useCallback(async (orderedSlugs: string[]) => {
    const prev = itemsRef.current;
    const next = reorderBySlugs(prev, orderedSlugs);
    setItems(next);
    try {
      await persist(next);
    } catch (error) {
      setItems(prev);
      throw error;
    }
  }, [persist]);

  const get = useCallback((slug: string) => items.find((p) => p.slug === slug), [items]);

  const value = useMemo(
    () => ({
      products: items,
      ready,
      saving,
      get,
      add,
      update,
      remove,
      restoreToBaseline,
      reload,
      moveProduct,
      reorderProducts,
    }),
    [items, ready, saving, get, add, update, remove, restoreToBaseline, reload, moveProduct, reorderProducts]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
