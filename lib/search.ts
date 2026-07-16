import { Product } from "@/lib/products";

export function matchesProductSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    product.name,
    product.name_ar,
    product.tagline,
    product.tagline_ar,
    product.collection,
    product.family,
    product.gender,
    product.slug,
    ...product.notes.top,
    ...product.notes.heart,
    ...product.notes.base,
    ...(product.notes_ar?.top ?? []),
    ...(product.notes_ar?.heart ?? []),
    ...(product.notes_ar?.base ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
