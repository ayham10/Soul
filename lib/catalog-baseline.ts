import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { Product } from "@/lib/products";
import { prepareCatalog } from "@/lib/inventory";

export const BASELINE_VERSION = "103-v1";
export const EXPECTED_BASELINE_PRODUCT_COUNT = 103;

export type CatalogBaselineManifest = {
  baselineVersion: string;
  productCount: number;
  createdAt: string;
  sourceBackup: string;
  sourceBackupCreatedAt?: string;
  sha256: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
export const BASELINE_FILE = path.join(DATA_DIR, "catalog-baseline.json");
export const BASELINE_MANIFEST_FILE = path.join(DATA_DIR, "catalog-baseline.manifest.json");

export const BASELINE_RESTORE_CONFIRMATION_PHRASE = "RESET TO 103 BASELINE";

export class CatalogBaselineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogBaselineError";
  }
}

function readJsonFile(filePath: string): unknown {
  if (!existsSync(filePath)) {
    throw new CatalogBaselineError(`Missing baseline file: ${filePath}`);
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    throw new CatalogBaselineError(`Invalid JSON in baseline file: ${filePath}`);
  }
}

export function loadCatalogBaselineManifest(): CatalogBaselineManifest {
  const raw = readJsonFile(BASELINE_MANIFEST_FILE) as Partial<CatalogBaselineManifest>;
  if (!raw || typeof raw !== "object") {
    throw new CatalogBaselineError("Invalid baseline manifest.");
  }
  if (typeof raw.baselineVersion !== "string" || !raw.baselineVersion) {
    throw new CatalogBaselineError("Baseline manifest missing baselineVersion.");
  }
  if (typeof raw.productCount !== "number" || raw.productCount !== EXPECTED_BASELINE_PRODUCT_COUNT) {
    throw new CatalogBaselineError(
      `Baseline manifest productCount must be ${EXPECTED_BASELINE_PRODUCT_COUNT}.`
    );
  }
  if (typeof raw.createdAt !== "string" || !raw.createdAt) {
    throw new CatalogBaselineError("Baseline manifest missing createdAt.");
  }
  if (typeof raw.sourceBackup !== "string" || !raw.sourceBackup) {
    throw new CatalogBaselineError("Baseline manifest missing sourceBackup.");
  }
  if (typeof raw.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(raw.sha256)) {
    throw new CatalogBaselineError("Baseline manifest missing valid sha256.");
  }
  return raw as CatalogBaselineManifest;
}

function assertBaselineProductShape(product: unknown, index: number): asserts product is Product {
  if (!product || typeof product !== "object") {
    throw new CatalogBaselineError(`Baseline product at index ${index} is not an object.`);
  }
  const p = product as Record<string, unknown>;
  if ("imageBackup" in p) {
    throw new CatalogBaselineError(`Baseline product at index ${index} contains forbidden imageBackup field.`);
  }
  for (const key of ["slug", "name", "collection", "family", "gender", "image", "accent"]) {
    if (typeof p[key] !== "string" || !(p[key] as string).length) {
      throw new CatalogBaselineError(`Baseline product at index ${index} missing or invalid ${key}.`);
    }
  }
  if (typeof p.price !== "number" || !Number.isFinite(p.price)) {
    throw new CatalogBaselineError(`Baseline product at index ${index} has invalid price.`);
  }
  if (typeof p.image === "string" && !p.image.includes("/storage/v1/object/public/perfumes/")) {
    throw new CatalogBaselineError(`Baseline product at index ${index} must use Supabase Storage image URL.`);
  }
}

export function loadCatalogBaselineProducts(): Product[] {
  const manifest = loadCatalogBaselineManifest();
  const raw = readJsonFile(BASELINE_FILE) as { products?: unknown; baselineVersion?: string };
  const fileContents = readFileSync(BASELINE_FILE, "utf8");
  const sha256 = createHash("sha256").update(fileContents).digest("hex");
  if (sha256 !== manifest.sha256) {
    throw new CatalogBaselineError("Baseline file checksum does not match manifest sha256.");
  }

  if (!raw || typeof raw !== "object" || !Array.isArray(raw.products)) {
    throw new CatalogBaselineError("Baseline file must contain a products array.");
  }
  if (raw.products.length !== EXPECTED_BASELINE_PRODUCT_COUNT) {
    throw new CatalogBaselineError(
      `Baseline must contain exactly ${EXPECTED_BASELINE_PRODUCT_COUNT} products.`
    );
  }

  raw.products.forEach((product, index) => assertBaselineProductShape(product, index));

  const slugs = raw.products.map((p) => (p as Product).slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new CatalogBaselineError("Baseline contains duplicate product slugs.");
  }

  return prepareCatalog(raw.products as Product[]);
}

export function getCatalogBaselineInfo() {
  const manifest = loadCatalogBaselineManifest();
  return {
    baselineVersion: manifest.baselineVersion,
    productCount: manifest.productCount,
    createdAt: manifest.createdAt,
    sourceBackup: manifest.sourceBackup,
    confirmationPhrase: BASELINE_RESTORE_CONFIRMATION_PHRASE,
  };
}
