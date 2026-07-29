import { Product } from "@/lib/products";

export type StockStatus = "in" | "low" | "out";

export function parseStock(value: unknown, fallback = 50): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

export function parseDisplayOrder(value: unknown): number | undefined {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.floor(n);
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= 10) return "low";
  return "in";
}

export function sortByDisplayOrder(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const diff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

export function prepareCatalog(products: Product[]): Product[] {
  const withDefaults = products.map((product, index) => ({
    ...product,
    stock: parseStock(product.stock),
    displayOrder: parseDisplayOrder(product.displayOrder) ?? index,
  }));
  return sortByDisplayOrder(withDefaults).map((product, index) => ({
    ...product,
    displayOrder: index,
  }));
}

export function nextDisplayOrder(products: Product[]): number {
  if (!products.length) return 0;
  return Math.max(...products.map((p) => p.displayOrder ?? 0)) + 1;
}

export function swapDisplayOrder(
  products: Product[],
  slug: string,
  direction: "up" | "down"
): Product[] {
  const sorted = prepareCatalog(products);
  const index = sorted.findIndex((p) => p.slug === slug);
  if (index < 0) return sorted;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= sorted.length) return sorted;

  const next = [...sorted];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((product, i) => ({ ...product, displayOrder: i }));
}

export function reorderBySlugs(products: Product[], orderedSlugs: string[]): Product[] {
  const map = new Map(products.map((p) => [p.slug, p]));
  const reordered: Product[] = [];

  orderedSlugs.forEach((slug) => {
    const product = map.get(slug);
    if (product) reordered.push(product);
  });

  products.forEach((product) => {
    if (!orderedSlugs.includes(product.slug)) reordered.push(product);
  });

  return reordered.map((product, index) => ({ ...product, displayOrder: index }));
}
