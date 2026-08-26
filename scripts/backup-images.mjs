#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "fs";
import { backupImagesForCatalog } from "./lib/image-backup.mjs";
import { buildManifestDraft, readCatalog, writeManifest } from "./lib/manifest.mjs";
import { catalogPath, ensureBackupLayout } from "./lib/backup-paths.mjs";
import { assertNoSecretFields } from "./lib/catalog-schema.mjs";

function parseArgs(argv) {
  const args = { backupDir: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" || arg === "-d") args.backupDir = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/backup-images.mjs --dir <backup-directory>

Downloads every Supabase Storage image referenced by backups/<date>/catalog.json.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.backupDir) {
    throw new Error("Missing required --dir <backup-directory>");
  }

  return args;
}

function loadProducts(backupDir) {
  const raw = JSON.parse(readFileSync(catalogPath(backupDir), "utf8"));
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.products)) return raw.products;
  throw new Error("catalog.json must contain a products array");
}

async function main() {
  const args = parseArgs(process.argv);
  if (!existsSync(catalogPath(args.backupDir))) {
    throw new Error(`Missing catalog.json in ${args.backupDir}`);
  }

  ensureBackupLayout(args.backupDir);
  const products = loadProducts(args.backupDir);
  const { images, failures, productsWithBackupPaths } = await backupImagesForCatalog(
    args.backupDir,
    products
  );

  assertNoSecretFields(productsWithBackupPaths);

  const existingManifest = existsSync(`${args.backupDir}/manifest.json`)
    ? JSON.parse(readFileSync(`${args.backupDir}/manifest.json`, "utf8"))
    : {};

  const catalogEnvelope = JSON.parse(readFileSync(catalogPath(args.backupDir), "utf8"));
  const payload = Array.isArray(catalogEnvelope)
    ? { products: productsWithBackupPaths }
    : { ...catalogEnvelope, productCount: productsWithBackupPaths.length, products: productsWithBackupPaths };

  writeFileSync(catalogPath(args.backupDir), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const manifest = buildManifestDraft({
    backupDir: args.backupDir,
    createdAt: existingManifest.createdAt || new Date().toISOString(),
    source: payload.source || existingManifest.source || "Supabase",
    table: payload.table || existingManifest.table || "public.soul_catalog",
    catalogId: payload.catalogId || existingManifest.catalogId || "default",
    supabaseUpdatedAt: payload.supabaseUpdatedAt ?? existingManifest.supabaseUpdatedAt ?? null,
    catalogUrl: payload.catalogUrl ?? existingManifest.catalogUrl ?? null,
    products: productsWithBackupPaths,
    images,
    failures,
  });

  assertNoSecretFields(manifest);
  writeManifest(args.backupDir, manifest);

  console.error(`Image backup complete: ${args.backupDir}`);
  console.error(`Unique images: ${manifest.uniqueImages}`);
  console.error(`Downloaded: ${manifest.downloadedImages}`);
  console.error(`Failed: ${manifest.failedImages}`);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
