#!/usr/bin/env node
import { writeFileSync } from "fs";
import { readLiveCatalog } from "./lib/supabase-catalog.mjs";
import { backupImagesForCatalog } from "./lib/image-backup.mjs";
import { buildManifestDraft, writeManifest } from "./lib/manifest.mjs";
import {
  catalogPath,
  ensureBackupLayout,
  formatBackupDate,
  resolveBackupDir,
} from "./lib/backup-paths.mjs";
import {
  assertNoSecretFields,
  cloneCatalogProducts,
  validateCatalogProducts,
} from "./lib/catalog-schema.mjs";
import { verifyBackupContents } from "./lib/manifest.mjs";

function parseArgs(argv) {
  const args = { date: formatBackupDate(), catalogUrl: process.env.CATALOG_BACKUP_URL || null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--date") args.date = argv[++i];
    else if (arg === "--catalog-url") args.catalogUrl = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run backup [-- --date YYYY-MM-DD] [-- --catalog-url URL]

Performs a complete independent backup:
  1. Reads the live Supabase catalog (id=default)
  2. Downloads every referenced Supabase Storage image
  3. Writes catalog.json, manifest.json, and images/perfumes/*
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

  console.error(`Creating backup in ${backupDir}`);

  const live = await readLiveCatalog({ catalogUrl: args.catalogUrl });
  if (!live.rowExists) {
    throw new Error("Live catalog row was not found");
  }

  const validation = validateCatalogProducts(live.products);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const products = cloneCatalogProducts(live.products);
  assertNoSecretFields(products);

  const { images, failures, productsWithBackupPaths } = await backupImagesForCatalog(
    backupDir,
    products
  );

  const payload = {
    backupVersion: 1,
    backedUpAt: new Date().toISOString(),
    source: args.catalogUrl ? "catalog-url" : "Supabase",
    table: "public.soul_catalog",
    catalogId: "default",
    supabaseUpdatedAt: live.updatedAt,
    catalogUrl: live.sourceUrl ?? null,
    productCount: productsWithBackupPaths.length,
    products: productsWithBackupPaths,
  };

  assertNoSecretFields(payload);
  writeFileSync(catalogPath(backupDir), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const manifest = buildManifestDraft({
    backupDir,
    source: payload.source,
    table: payload.table,
    catalogId: payload.catalogId,
    supabaseUpdatedAt: payload.supabaseUpdatedAt,
    catalogUrl: payload.catalogUrl,
    products: productsWithBackupPaths,
    images,
    failures,
  });

  assertNoSecretFields(manifest);
  writeManifest(backupDir, manifest);

  const verification = verifyBackupContents(backupDir, { touchManifest: true });

  console.error(`Backup directory: ${backupDir}`);
  console.error(`Products: ${manifest.productCount}`);
  console.error(`Unique images: ${manifest.uniqueImages}`);
  console.error(`Downloaded images: ${manifest.downloadedImages}`);
  console.error(`Failed images: ${manifest.failedImages}`);
  console.error(`Verified: ${verification.verified}`);

  if (!verification.verified) {
    console.error("Verification errors:");
    verification.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(JSON.stringify({ backupDir, manifest, verified: verification.verified }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
