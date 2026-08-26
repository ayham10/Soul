import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

export const CATALOG_TABLE = process.env.SUPABASE_CATALOG_TABLE || "soul_catalog";
export const CATALOG_ID = process.env.SUPABASE_CATALOG_ID || "default";

export function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return { url, secretKey };
}

function headers(config) {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Read the live catalog row from Supabase (SELECT only — no writes).
 */
export async function readCatalogFromSupabase() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY, or use --catalog-url for a read-only catalog fetch."
    );
  }

  const url = `${config.url}/rest/v1/${CATALOG_TABLE}?id=eq.${encodeURIComponent(CATALOG_ID)}&select=id,products,updated_at&limit=1`;
  const response = await fetch(url, {
    headers: headers(config),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase catalog read failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return { rowExists: false, products: [], updatedAt: null };
  }

  const row = rows[0];
  const products = Array.isArray(row.products) ? row.products : [];
  return {
    rowExists: true,
    products,
    updatedAt: row.updated_at ?? null,
  };
}

/**
 * Read-only catalog fetch from a public JSON endpoint (e.g. production GET /api/products).
 * Used when Supabase credentials are unavailable; performs no writes.
 */
export async function readCatalogFromUrl(catalogUrl) {
  const response = await fetch(catalogUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Catalog URL fetch failed (${response.status})`);
  }

  const data = await response.json();
  const products = Array.isArray(data?.products) ? data.products : null;
  if (!products) {
    throw new Error("Catalog URL response did not contain a products array");
  }

  return {
    rowExists: true,
    products,
    updatedAt: null,
    sourceUrl: catalogUrl,
  };
}

export async function readLiveCatalog(options = {}) {
  if (options.catalogUrl) {
    return readCatalogFromUrl(options.catalogUrl);
  }
  return readCatalogFromSupabase();
}

/**
 * Upsert catalog products into Supabase (restore only).
 */
export async function writeCatalogToSupabase(products) {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Refusing to write an empty catalog to Supabase");
  }

  const url = `${config.url}/rest/v1/${CATALOG_TABLE}?on_conflict=id`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...headers(config),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: CATALOG_ID,
      products,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase catalog write failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
}
