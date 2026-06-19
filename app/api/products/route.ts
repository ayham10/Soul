import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Product, products as seedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "catalog.json");
const CATALOG_KEY = process.env.PRODUCTS_CATALOG_KEY || "soul:catalog:v1";

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return (
    typeof p.slug === "string" &&
    typeof p.name === "string" &&
    typeof p.family === "string" &&
    typeof p.gender === "string" &&
    typeof p.tagline === "string" &&
    typeof p.description === "string" &&
    typeof p.price === "number" &&
    Number.isFinite(p.price) &&
    typeof p.image === "string" &&
    typeof p.accent === "string" &&
    !!p.notes &&
    Array.isArray(p.notes.top) &&
    Array.isArray(p.notes.heart) &&
    Array.isArray(p.notes.base)
  );
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
  if (Array.isArray(parsed) && parsed.every(isProduct)) return parsed;
  return null;
}

async function writeRemoteCatalog(products: Product[]) {
  const response = await redisCommand(["SET", CATALOG_KEY, JSON.stringify(products)]);
  if (response?.error) throw new Error(response.error);
}

async function readLocalCatalog(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isProduct)) return parsed;
  } catch {}
  return seedProducts;
}

async function writeLocalCatalog(products: Product[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
}

async function readCatalog(): Promise<{ products: Product[]; storage: "redis" | "filesystem" }> {
  if (redisConfig()) {
    const remote = await readRemoteCatalog();
    if (remote) return { products: remote, storage: "redis" };
    await writeRemoteCatalog(seedProducts);
    return { products: seedProducts, storage: "redis" };
  }

  return { products: await readLocalCatalog(), storage: "filesystem" };
}

async function writeCatalog(products: Product[]) {
  if (redisConfig()) {
    await writeRemoteCatalog(products);
    return "redis" as const;
  }

  await writeLocalCatalog(products);
  return "filesystem" as const;
}

export async function GET() {
  const { products, storage } = await readCatalog();
  return NextResponse.json(
    { products, storage },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const products = body?.products;

  if (!Array.isArray(products) || !products.every(isProduct)) {
    return NextResponse.json({ error: "Invalid catalogue payload." }, { status: 400 });
  }

  const storage = await writeCatalog(products);
  return NextResponse.json(
    { products, storage },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
