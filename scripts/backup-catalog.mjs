#!/usr/bin/env node
import { writeFileSync } from "fs";
import { readLiveCatalog } from "./lib/supabase-catalog.mjs";
import { assertNoSecretFields, cloneCatalogProducts, validateCatalogProducts } from "./lib/catalog-schema.mjs";
import {
  catalogPath,
  ensureBackupLayout,
  formatBackupDate,
  resolveBackupDir,
} from "./lib/backup-paths.mjs";

function parseArgs(argv) {
  const args = { date: formatBackupDate(), catalogUrl: process.env.CATALOG_BACKUP_URL || null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--date") args.date = argv[++i];
    else if (arg === "--catalog-url") args.catalogUrl = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/backup-catalog.mjs [--date YYYY-MM-DD] [--catalog-url URL]

Reads the live Supabase catalog row (id=default) and writes backups/<date>/catalog.json.
If Supabase credentials are unavailable, pass --catalog-url for a read-only catalog fetch.
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const backupDir = resolveBackupDir(args.date);
  ensureBackupLayout(backupDir);

  const live = await readLiveCatalog({ catalogUrl: args.catalogUrl });
  if (!live.rowExists) {
    throw new Error("Live catalog row was not found in Supabase");
  }

  const validation = validateCatalogProducts(live.products);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const products = cloneCatalogProducts(live.products);
  assertNoSecretFields(products);

  const payload = {
    backupVersion: 1,
    backedUpAt: new Date().toISOString(),
    source: args.catalogUrl ? "catalog-url" : "Supabase",
    table: "public.soul_catalog",
    catalogId: "default",
    supabaseUpdatedAt: live.updatedAt,
    catalogUrl: live.sourceUrl ?? null,
    productCount: products.length,
    products,
  };

  writeFileSync(catalogPath(backupDir), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.error(`Catalog backup written: ${catalogPath(backupDir)}`);
  console.error(`Products: ${products.length}`);
  console.log(JSON.stringify({ backupDir, productCount: products.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
