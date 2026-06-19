import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Product, products as seedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "catalog.json");

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

async function readCatalog(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isProduct)) return parsed;
  } catch {}
  return seedProducts;
}

async function writeCatalog(products: Product[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), "utf8");
}

export async function GET() {
  const products = await readCatalog();
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const products = body?.products;

  if (!Array.isArray(products) || !products.every(isProduct)) {
    return NextResponse.json({ error: "Invalid catalogue payload." }, { status: 400 });
  }

  await writeCatalog(products);
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
