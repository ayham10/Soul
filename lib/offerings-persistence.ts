import { promises as fs } from "fs";
import path from "path";
import { SoulOffering, prepareOfferings } from "@/lib/soul-offerings";
import { writeSupabaseCatalogRow } from "@/lib/catalog-supabase-write";
import { isBase64Image, sanitizeProductImage } from "@/lib/storage";

export const OFFERINGS_SUPABASE_CATALOG_ID =
  process.env.SUPABASE_OFFERINGS_CATALOG_ID || "soul-offerings";
export const OFFERINGS_REDIS_KEY = process.env.SOUL_OFFERINGS_REDIS_KEY || "soul:offerings:v1";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "soul-offerings.json");
const SUPABASE_CATALOG_TABLE = process.env.SUPABASE_CATALOG_TABLE || "soul_catalog";

export type OfferingsStorageMode = "supabase" | "redis" | "filesystem";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && secretKey
    ? { url: url.replace(/\/$/, ""), secretKey }
    : null;
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function supabaseHeaders(config: NonNullable<ReturnType<typeof supabaseConfig>>) {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    "Content-Type": "application/json",
  };
}

function isOfferingStatus(value: unknown): value is SoulOffering["status"] {
  return (
    value === "available" ||
    value === "limited" ||
    value === "coming_soon" ||
    value === "unavailable"
  );
}

export function normalizeOffering(value: unknown): SoulOffering | null {
  if (!value || typeof value !== "object") return null;
  const raw = { ...(value as Record<string, unknown>) };

  if (typeof raw.image === "string" && isBase64Image(raw.image)) {
    raw.image = sanitizeProductImage(raw.image);
  }
  if (typeof raw.price === "string") {
    const parsed = Number(raw.price);
    raw.price = Number.isFinite(parsed) ? parsed : null;
  }
  if (raw.price != null && typeof raw.price !== "number") raw.price = null;
  if (typeof raw.displayOrder === "string") raw.displayOrder = Number(raw.displayOrder);
  if (typeof raw.published !== "boolean") raw.published = raw.published !== false;
  if (!isOfferingStatus(raw.status)) raw.status = "available";

  const o = raw as Partial<SoulOffering>;
  if (
    typeof o.slug !== "string" ||
    !o.slug.length ||
    typeof o.title !== "string" ||
    !o.title.length ||
    typeof o.description !== "string" ||
    typeof o.image !== "string" ||
    !o.image.length ||
    typeof o.ctaText !== "string" ||
    !o.ctaText.length ||
    typeof o.displayOrder !== "number" ||
    !Number.isFinite(o.displayOrder)
  ) {
    return null;
  }

  return {
    slug: o.slug,
    title: o.title,
    title_ar: typeof o.title_ar === "string" ? o.title_ar : undefined,
    description: o.description,
    description_ar: typeof o.description_ar === "string" ? o.description_ar : undefined,
    price: o.price ?? null,
    priceLabel: typeof o.priceLabel === "string" ? o.priceLabel : undefined,
    priceLabel_ar: typeof o.priceLabel_ar === "string" ? o.priceLabel_ar : undefined,
    image: o.image,
    status: raw.status as SoulOffering["status"],
    ctaText: o.ctaText,
    ctaText_ar: typeof o.ctaText_ar === "string" ? o.ctaText_ar : undefined,
    ctaHref: typeof o.ctaHref === "string" ? o.ctaHref : undefined,
    displayOrder: o.displayOrder,
    published: o.published !== false,
  };
}

export function normalizeOfferingsList(offerings: unknown): SoulOffering[] | null {
  if (!Array.isArray(offerings)) return null;
  const normalized = offerings.map(normalizeOffering);
  if (normalized.some((item) => !item)) return null;
  return prepareOfferings(normalized as SoulOffering[]);
}

async function redisCommand(command: unknown[]) {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Offerings store request failed: ${response.status}`);
  }

  return response.json() as Promise<{ result?: unknown; error?: string }>;
}

async function readSupabaseOfferings(): Promise<SoulOffering[]> {
  const config = supabaseConfig();
  if (!config) return [];

  const url = `${config.url}/rest/v1/${SUPABASE_CATALOG_TABLE}?id=eq.${encodeURIComponent(OFFERINGS_SUPABASE_CATALOG_ID)}&select=products&limit=1`;
  const response = await fetch(url, {
    headers: supabaseHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase offerings read failed: ${response.status}`);
  }

  const rows = (await response.json()) as { products?: unknown }[];
  if (!rows.length) return [];

  const normalized = normalizeOfferingsList(rows[0]?.products);
  return normalized ?? [];
}

async function writeSupabaseOfferings(offerings: SoulOffering[]) {
  await writeSupabaseCatalogRow(OFFERINGS_SUPABASE_CATALOG_ID, offerings);
}

async function readRedisOfferings(): Promise<SoulOffering[] | null> {
  const response = await redisCommand(["GET", OFFERINGS_REDIS_KEY]);
  if (!response?.result) return null;
  const parsed = typeof response.result === "string" ? JSON.parse(response.result) : response.result;
  return normalizeOfferingsList(parsed);
}

async function writeRedisOfferings(offerings: SoulOffering[]) {
  const response = await redisCommand(["SET", OFFERINGS_REDIS_KEY, JSON.stringify(offerings)]);
  if (response?.error) throw new Error(response.error);
}

async function readLocalOfferings(): Promise<SoulOffering[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const offerings = Array.isArray(parsed) ? parsed : parsed?.offerings;
    const normalized = normalizeOfferingsList(offerings);
    return normalized ?? [];
  } catch {
    return [];
  }
}

async function writeLocalOfferings(offerings: SoulOffering[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify({ updatedAt: new Date().toISOString(), offerings }, null, 2),
    "utf8"
  );
}

export async function readOfferingsCatalog(): Promise<{
  offerings: SoulOffering[];
  storage: OfferingsStorageMode;
}> {
  if (supabaseConfig()) {
    const offerings = await readSupabaseOfferings();
    return { offerings, storage: "supabase" };
  }

  if (redisConfig()) {
    const remote = await readRedisOfferings();
    return { offerings: remote ?? [], storage: "redis" };
  }

  return { offerings: await readLocalOfferings(), storage: "filesystem" };
}

export async function writeOfferingsCatalog(offerings: SoulOffering[]) {
  if (supabaseConfig()) {
    await writeSupabaseOfferings(offerings);
    return "supabase" as const;
  }

  if (redisConfig()) {
    await writeRedisOfferings(offerings);
    return "redis" as const;
  }

  await writeLocalOfferings(offerings);
  return "filesystem" as const;
}
