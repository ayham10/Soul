"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { SoulOffering } from "@/lib/soul-offerings";
import { slugify } from "@/lib/slug";

interface OfferingsContextType {
  offerings: SoulOffering[];
  ready: boolean;
  saving: boolean;
  get: (slug: string) => SoulOffering | undefined;
  add: (offering: SoulOffering) => Promise<void>;
  update: (slug: string, offering: SoulOffering) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  reload: () => Promise<void>;
}

const OfferingsContext = createContext<OfferingsContextType | null>(null);
const STORAGE_KEY = "soul-offerings-v1";

async function fetchOfferings(): Promise<{ offerings: SoulOffering[]; storage: string }> {
  const response = await fetch("/api/soul-offerings", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load offerings");
  const data = await response.json();
  if (!Array.isArray(data.offerings)) throw new Error("Invalid offerings response");
  return { offerings: data.offerings as SoulOffering[], storage: data.storage ?? "unknown" };
}

async function saveOfferings(offerings: SoulOffering[]): Promise<{ offerings: SoulOffering[]; storage: string }> {
  const response = await fetch("/api/soul-offerings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ offerings }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Unable to save offerings");
  }
  if (!Array.isArray(data.offerings)) {
    throw new Error("Invalid save response from server");
  }
  return { offerings: data.offerings as SoulOffering[], storage: data.storage ?? "unknown" };
}

function cacheOfferings(offerings: SoulOffering[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offerings));
  } catch {}
}

function readCachedOfferings(): SoulOffering[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function OfferingsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SoulOffering[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const applyOfferings = useCallback((offerings: SoulOffering[]) => {
    setItems(offerings);
    cacheOfferings(offerings);
  }, []);

  const reload = useCallback(async () => {
    const { offerings, storage } = await fetchOfferings();
    if (storage === "filesystem") {
      const cached = readCachedOfferings();
      if (cached) {
        applyOfferings(cached);
        return;
      }
    }
    applyOfferings(offerings);
  }, [applyOfferings]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { offerings, storage } = await fetchOfferings();
        if (!active) return;
        if (storage === "filesystem") {
          const cached = readCachedOfferings();
          applyOfferings(cached ?? offerings);
        } else {
          applyOfferings(offerings);
        }
      } catch {
        if (!active) return;
        const cached = readCachedOfferings();
        if (cached) applyOfferings(cached);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyOfferings]);

  const persist = useCallback(
    async (next: SoulOffering[]) => {
      setSaving(true);
      try {
        const { offerings: saved } = await saveOfferings(next);
        applyOfferings(saved);
      } finally {
        setSaving(false);
      }
    },
    [applyOfferings]
  );

  const add = useCallback(
    async (offering: SoulOffering) => {
      const prev = itemsRef.current;
      let slug = offering.slug || slugify(offering.title);
      const existing = new Set(prev.map((x) => x.slug));
      let i = 2;
      const baseSlug = slug;
      while (existing.has(slug)) slug = `${baseSlug}-${i++}`;
      const next = [{ ...offering, slug }, ...prev];
      setItems(next);
      try {
        await persist(next);
      } catch (error) {
        setItems(prev);
        throw error;
      }
    },
    [persist]
  );

  const update = useCallback(
    async (slug: string, offering: SoulOffering) => {
      const prev = itemsRef.current;
      const next = prev.map((x) => (x.slug === slug ? { ...offering, slug } : x));
      setItems(next);
      try {
        await persist(next);
      } catch (error) {
        setItems(prev);
        throw error;
      }
    },
    [persist]
  );

  const remove = useCallback(
    async (slug: string) => {
      const prev = itemsRef.current;
      const next = prev.filter((x) => x.slug !== slug);
      setItems(next);
      try {
        await persist(next);
      } catch (error) {
        setItems(prev);
        throw error;
      }
    },
    [persist]
  );

  const get = useCallback((slug: string) => items.find((o) => o.slug === slug), [items]);

  const value = useMemo(
    () => ({ offerings: items, ready, saving, get, add, update, remove, reload }),
    [items, ready, saving, get, add, update, remove, reload]
  );

  return <OfferingsContext.Provider value={value}>{children}</OfferingsContext.Provider>;
}

export function useSoulOfferings() {
  const ctx = useContext(OfferingsContext);
  if (!ctx) throw new Error("useSoulOfferings must be used within OfferingsProvider");
  return ctx;
}
