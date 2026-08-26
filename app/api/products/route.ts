import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Product, products as seedProducts } from "@/lib/products";
import { requireAdminSession } from "@/lib/catalog-auth";
import {
  EMPTY_CATALOG_ERROR,
  assertNonEmptyCatalog,
  CATALOG_ROW_MISSING_ERROR,
  getRequestId,
  logSecurityRejection,
} from "@/lib/catalog-guard";
import { writeSupabaseCatalog } from "@/lib/catalog-supabase-write";
import { parseDisplayOrder, parseStock, prepareCatalog } from "@/lib/inventory";
import { isBase64Image, sanitizeProductImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "catalog.json");
const CATALOG_KEY = process.env.PRODUCTS_CATALOG_KEY || "soul:catalog:v1";
const SUPABASE_CATALOG_TABLE = process.env.SUPABASE_CATALOG_TABLE || "soul_catalog";
const SUPABASE_CATALOG_ID = process.env.SUPABASE_CATALOG_ID || "default";

type StorageMode = "supabase" | "redis" | "filesystem";

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

function supabaseHeaders(config: ReturnType<typeof supabaseConfig>) {
  if (!config) throw new Error("Supabase is not configured");
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    "Content-Type": "application/json",
  };
}

function normalizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const raw = { ...(value as Record<string, unknown>) };
  if (!raw.collection && raw.group) raw.collection = raw.group;
  if (typeof raw.image === "string" && isBase64Image(raw.image)) {
    raw.image = sanitizeProductImage(raw.image);
  }
  if (typeof raw.tagline !== "string") raw.tagline = "";
  if (typeof raw.description !== "string") raw.description = "";
  if (!raw.notes || typeof raw.notes !== "object") {
    raw.notes = { top: [], heart: [], base: [] };
  } else {
    const notes = raw.notes as Record<string, unknown>;
    if (!Array.isArray(notes.top)) notes.top = [];
    if (!Array.isArray(notes.heart)) notes.heart = [];
    if (!Array.isArray(notes.base)) notes.base = [];
    raw.notes = notes;
  }
  if (typeof raw.price === "string") raw.price = Number(raw.price);
  if (typeof raw.price50 === "string") raw.price50 = Number(raw.price50);
  if (raw.price50 != null && (typeof raw.price50 !== "number" || !Number.isFinite(raw.price50))) {
    delete raw.price50;
  }
  raw.stock = parseStock(raw.stock);
  raw.displayOrder = parseDisplayOrder(raw.displayOrder) ?? 0;
  if (!isProduct(raw)) return null;
  return raw as Product;
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return (
    typeof p.slug === "string" &&
    p.slug.length > 0 &&
    typeof p.name === "string" &&
    p.name.length > 0 &&
    typeof p.collection === "string" &&
    typeof p.family === "string" &&
    typeof p.gender === "string" &&
    typeof p.tagline === "string" &&
    typeof p.description === "string" &&
    typeof p.price === "number" &&
    Number.isFinite(p.price) &&
    typeof p.image === "string" &&
    p.image.length > 0 &&
    typeof p.accent === "string" &&
    !!p.notes &&
    Array.isArray(p.notes.top) &&
    Array.isArray(p.notes.heart) &&
    Array.isArray(p.notes.base) &&
    typeof p.stock === "number" &&
    Number.isFinite(p.stock) &&
    p.stock >= 0 &&
    typeof p.displayOrder === "number" &&
    Number.isFinite(p.displayOrder)
  );
}

function normalizeCatalog(products: unknown): Product[] | null {
  if (!Array.isArray(products)) return null;
  const normalized = products.map(normalizeProduct);
  if (normalized.some((p) => !p)) return null;
  return prepareCatalog(normalized as Product[]);
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
    throw new Error(`Catalogue store request failed: ${response.status}`);
  }

  return response.json() as Promise<{ result?: unknown; error?: string }>;
}

async function readRemoteCatalog(): Promise<Product[] | null> {
  const response = await redisCommand(["GET", CATALOG_KEY]);
  if (!response?.result) return null;

  const parsed = typeof response.result === "string" ? JSON.parse(response.result) : response.result;
  return normalizeCatalog(parsed);
}

async function writeRemoteCatalog(products: Product[]) {
  const response = await redisCommand(["SET", CATALOG_KEY, JSON.stringify(products)]);
  if (response?.error) throw new Error(response.error);
}

async function readSupabaseCatalog(): Promise<{ products: Product[]; rowExists: boolean } | null> {
  const config = supabaseConfig();
  if (!config) return null;

  const url = `${config.url}/rest/v1/${SUPABASE_CATALOG_TABLE}?id=eq.${encodeURIComponent(SUPABASE_CATALOG_ID)}&select=products&limit=1`;
  const response = await fetch(url, {
    headers: supabaseHeaders(config),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase catalogue read failed: ${response.status}`);
  }

  const rows = await response.json() as { products?: unknown }[];
  if (!rows.length) return { products: [], rowExists: false };

  const normalized = normalizeCatalog(rows[0]?.products);
  if (!normalized) return { products: [], rowExists: true };
  return { products: normalized, rowExists: true };
}

async function readLocalCatalog(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const products = Array.isArray(parsed) ? parsed : parsed?.products;
    const normalized = normalizeCatalog(products);
    if (normalized?.length) return normalized;
  } catch {}
  return prepareCatalog(seedProducts);
}

async function writeLocalCatalog(products: Product[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify({ updatedAt: new Date().toISOString(), products }, null, 2),
    "utf8"
  );
}

async function readCatalog(): Promise<{ products: Product[]; storage: StorageMode }> {
  if (supabaseConfig()) {
    const result = await readSupabaseCatalog();
    if (result?.rowExists) return { products: prepareCatalog(result.products), storage: "supabase" };
    throw new Error(CATALOG_ROW_MISSING_ERROR);
  }

  if (redisConfig()) {
    const remote = await readRemoteCatalog();
    if (remote) return { products: prepareCatalog(remote), storage: "redis" };
    throw new Error(CATALOG_ROW_MISSING_ERROR);
  }

  return { products: await readLocalCatalog(), storage: "filesystem" };
}

async function writeCatalog(products: Product[]) {
  if (supabaseConfig()) {
    await writeSupabaseCatalog(products);
    return "supabase" as const;
  }

  if (redisConfig()) {
    await writeRemoteCatalog(products);
    return "redis" as const;
  }

  await writeLocalCatalog(products);
  return "filesystem" as const;
}

export async function GET() {
  try {
    const { products, storage } = await readCatalog();
    return NextResponse.json(
      { products, storage },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load product catalogue";
    const status = message === CATALOG_ROW_MISSING_ERROR ? 503 : 500;
    return NextResponse.json({ error: message, products: [], storage: "supabase" }, { status });
  }
}

export async function PUT(request: Request) {
  const endpoint = "PUT /api/products";
  const requestId = getRequestId(request);
  const auth = requireAdminSession(request);

  if (!auth.ok) {
    logSecurityRejection({
      endpoint,
      reason: auth.status === 503 ? "auth_not_configured" : "unauthorized",
      authenticated: false,
      requestId,
      event: "admin_access_rejected",
    });
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const products = body?.products;

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "Invalid catalogue payload." }, { status: 400 });
  }

  if (products.length === 0) {
    logSecurityRejection({
      endpoint,
      reason: "empty_catalog",
      authenticated: true,
      requestId,
    });
    return NextResponse.json({ error: EMPTY_CATALOG_ERROR }, { status: 400 });
  }

  const normalized = normalizeCatalog(products);
  if (!normalized) {
    return NextResponse.json(
      { error: "Invalid catalogue payload. Each product needs name, collection, family, gender, price, image, and notes." },
      { status: 400 }
    );
  }

  try {
    assertNonEmptyCatalog(normalized);
  } catch {
    logSecurityRejection({
      endpoint,
      reason: "empty_catalog",
      authenticated: true,
      requestId,
    });
    return NextResponse.json({ error: EMPTY_CATALOG_ERROR }, { status: 400 });
  }

  if (normalized.some((p) => isBase64Image(p.image))) {
    return NextResponse.json(
      { error: "Catalogue contains embedded Base64 images. Upload images to Storage first, then save again." },
      { status: 413 }
    );
  }

  try {
    const storage = await writeCatalog(normalized);
    return NextResponse.json(
      { products: normalized, storage },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Catalogue save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
