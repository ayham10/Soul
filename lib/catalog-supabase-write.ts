import { Product } from "@/lib/products";
import { assertNonEmptyCatalog } from "@/lib/catalog-guard";

const SUPABASE_CATALOG_TABLE = process.env.SUPABASE_CATALOG_TABLE || "soul_catalog";
const SUPABASE_CATALOG_ID = process.env.SUPABASE_CATALOG_ID || "default";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && secretKey
    ? { url: url.replace(/\/$/, ""), secretKey }
    : null;
}

function supabaseHeaders(config: NonNullable<ReturnType<typeof supabaseConfig>>) {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    "Content-Type": "application/json",
  };
}

export async function writeSupabaseCatalog(products: Product[]) {
  assertNonEmptyCatalog(products);

  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured");

  const url = `${config.url}/rest/v1/${SUPABASE_CATALOG_TABLE}?on_conflict=id`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...supabaseHeaders(config),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: SUPABASE_CATALOG_ID,
      products,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase catalogue write failed: ${response.status}`);
  }
}
