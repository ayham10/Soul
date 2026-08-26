import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { sha256File } from "./checksum.mjs";
import { validateCatalogProducts } from "./catalog-schema.mjs";
import { catalogPath, localImageAbsolutePath, manifestPath } from "./backup-paths.mjs";

export const MANIFEST_VERSION = 1;

export function buildManifestDraft({
  backupDir,
  createdAt = new Date().toISOString(),
  source = "Supabase",
  table = "public.soul_catalog",
  catalogId = "default",
  supabaseUpdatedAt = null,
  catalogUrl = null,
  products = [],
  images = [],
  failures = [],
}) {
  const downloadedImages = images.filter((image) => image.downloaded).length;
  const failedImages = failures.length;
  const uniqueImages = images.length;

  return {
    backupVersion: MANIFEST_VERSION,
    createdAt,
    source,
    table,
    catalogId,
    supabaseUpdatedAt,
    catalogUrl,
    backupDirectory: basename(backupDir),
    productCount: products.length,
    uniqueImages,
    downloadedImages,
    failedImages,
    verified: false,
    status: failedImages > 0 ? "partial" : "complete",
    images,
    failures,
  };
}

export function writeManifest(backupDir, manifest) {
  writeFileSync(manifestPath(backupDir), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export function readManifest(backupDir) {
  const path = manifestPath(backupDir);
  if (!existsSync(path)) {
    throw new Error(`Missing manifest.json in ${backupDir}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readCatalog(backupDir) {
  const path = catalogPath(backupDir);
  if (!existsSync(path)) {
    throw new Error(`Missing catalog.json in ${backupDir}`);
  }
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.products)) return parsed.products;
  throw new Error("catalog.json must contain a products array");
}

export function verifyManifestInternalConsistency(manifest, products) {
  const errors = [];

  if (manifest.productCount !== products.length) {
    errors.push(`manifest.productCount (${manifest.productCount}) != catalog length (${products.length})`);
  }

  if (manifest.uniqueImages !== manifest.images.length) {
    errors.push(`manifest.uniqueImages (${manifest.uniqueImages}) != images list length (${manifest.images.length})`);
  }

  const downloaded = manifest.images.filter((image) => image.downloaded).length;
  if (manifest.downloadedImages !== downloaded) {
    errors.push(`manifest.downloadedImages (${manifest.downloadedImages}) != downloaded count (${downloaded})`);
  }

  if (manifest.failedImages !== manifest.failures.length) {
    errors.push(`manifest.failedImages (${manifest.failedImages}) != failures length (${manifest.failures.length})`);
  }

  return errors;
}

export function verifyBackupContents(backupDir, { touchManifest = false } = {}) {
  const errors = [];
  let manifest;
  let products;

  try {
    products = readCatalog(backupDir);
  } catch (error) {
    return {
      ok: false,
      verified: false,
      errors: [error instanceof Error ? error.message : "Invalid catalog.json"],
    };
  }

  const catalogValidation = validateCatalogProducts(products);
  if (!catalogValidation.ok) {
    errors.push(catalogValidation.error);
  }

  try {
    manifest = readManifest(backupDir);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Invalid manifest.json");
    return { ok: false, verified: false, errors, productCount: products.length };
  }

  errors.push(...verifyManifestInternalConsistency(manifest, products));

  for (const product of products) {
    if (!product.imageBackup) {
      errors.push(`product ${product.slug} is missing imageBackup`);
      continue;
    }

    const imagePath = localImageAbsolutePath(backupDir, product.imageBackup);
    if (!existsSync(imagePath)) {
      errors.push(`missing image file for ${product.slug}: ${product.imageBackup}`);
    }
  }

  for (const image of manifest.images) {
    if (!image.localPath) {
      errors.push(`manifest image entry missing localPath (${image.storagePath || "unknown"})`);
      continue;
    }

    const imagePath = localImageAbsolutePath(backupDir, image.localPath);
    if (!existsSync(imagePath)) {
      errors.push(`manifest image missing on disk: ${image.localPath}`);
      continue;
    }

    if (typeof image.bytes !== "number" || image.bytes <= 0) {
      errors.push(`manifest image has invalid byte size: ${image.localPath}`);
    }

    if (!image.sha256) {
      errors.push(`manifest image missing sha256: ${image.localPath}`);
      continue;
    }

    let actualSha;
    try {
      actualSha = sha256File(imagePath);
    } catch {
      errors.push(`unable to checksum image: ${image.localPath}`);
      continue;
    }

    if (actualSha !== image.sha256) {
      errors.push(`checksum mismatch for ${image.localPath}`);
    }
  }

  const verified = errors.length === 0;
  if (touchManifest && verified) {
    manifest.verified = true;
    manifest.verifiedAt = new Date().toISOString();
    writeManifest(backupDir, manifest);
  }

  return {
    ok: verified,
    verified,
    errors,
    manifest,
    productCount: products.length,
    uniqueImages: manifest.uniqueImages,
    downloadedImages: manifest.downloadedImages,
    failedImages: manifest.failedImages,
  };
}
