"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  ml: number;
  price: number;   // unit price in ILS for the chosen size
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, ml: number) => void;
  setQty: (slug: string, ml: number, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "soul-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount. This must run in an effect (not a
  // lazy initializer) so the server and first client render match and avoid a
  // hydration mismatch; the strict set-state-in-effect rule is disabled here.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.slug === item.slug && p.ml === item.ml);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string, ml: number) => {
    setItems((prev) => prev.filter((p) => !(p.slug === slug && p.ml === ml)));
  }, []);

  const setQty = useCallback((slug: string, ml: number, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.slug === slug && p.ml === ml ? { ...p, qty: Math.max(0, qty) } : p))
        .filter((p) => p.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((n, i) => n + i.qty * i.price, 0), [items]);

  return (
    <CartContext.Provider value={{ items, count, total, open, setOpen, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
