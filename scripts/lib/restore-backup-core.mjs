import { readFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { getSupabaseConfig, writeCatalogToSupabase } from "./supabase-catalog.mjs";
import { validateCatalogProducts, cloneCatalogProducts } from "./catalog-schema.mjs";
import { verifyBackupContents, readCatalog, readManifest } from "./manifest.mjs";
import { getPublicStorageUrl } from "./storage-path.mjs";
import { localImageAbsolutePath } from "./backup-paths.mjs";

export const RESTORE_CONFIRMATION_PHRASE = "RESTORE SOUL PERFUME";

export function stripBackupOnlyFields(products) {
  return products.map((product) => {
    const { imageBackup, ...rest } = product;
    return rest;
  });
}

export function buildRestorePlan(backupDir) {
  const verification = verifyBackupContents(backupDir);
  if (!verification.ok) {
    return {
      ok: false,
      errors: verification.errors,
    };
  }

  const products = readCatalog(backupDir);
  const manifest = readManifest(backupDir);
  const strippedProducts = stripBackupOnlyFields(products);

  const catalogValidation = validateCatalogProducts(strippedProducts);
  if (!catalogValidation.ok) {
    return { ok: false, errors: [catalogValidation.error] };
  }

  const imageActions = manifest.images.map((image) => ({
    storagePath: image.storagePath,
    localPath: image.localPath,
    bytes: image.bytes,
    sha256: image.sha256,
    action: "upload-if-missing",
  }));

  return {
    ok: true,
    productCount: strippedProducts.length,
    imageCount: manifest.images.length,
    downloadedImages: manifest.downloadedImages,
    failedImages: manifest.failedImages,
    products: strippedProducts,
    imageActions,
    manifest,
  };
}

async function objectExistsPublic(supabaseUrl, storagePath) {
  const url = getPublicStorageUrl(supabaseUrl, storagePath);
  const response = await fetch(url, { method: "HEAD", cache: "no-store" });
  return response.ok;
}

async function uploadMissingImage(config, backupDir, image, overwriteImages) {
  const absolutePath = localImageAbsolutePath(backupDir, image.localPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing local image file: ${image.localPath}`);
  }

  const exists = await objectExistsPublic(config.url, image.storagePath);
  if (exists && !overwriteImages) {
    return { storagePath: image.storagePath, action: "skipped-existing" };
  }

  const buffer = readFileSync(absolutePath);
  const url = `${config.url}/storage/v1/object/perfumes/${image.storagePath}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/octet-stream",
      ...(overwriteImages ? { "x-upsert": "true" } : {}),
    },
    body: buffer,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image upload failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  return {
    storagePath: image.storagePath,
    action: exists ? "overwritten" : "uploaded",
    publicUrl: getPublicStorageUrl(config.url, image.storagePath),
  };
}

export async function restoreBackup(backupDir, options = {}) {
  const plan = buildRestorePlan(backupDir);
  if (!plan.ok) {
    throw new Error(plan.errors.join("; "));
  }

  if (options.dryRun) {
    return {
      dryRun: true,
      productCount: plan.productCount,
      imageCount: plan.imageCount,
      downloadedImages: plan.downloadedImages,
      failedImages: plan.failedImages,
      wouldRestoreCatalog: true,
      wouldRestoreImages: plan.imageActions,
    };
  }

  if (!options.confirm) {
    throw new Error("Restore requires --confirm");
  }

  if (options.confirmPhrase !== RESTORE_CONFIRMATION_PHRASE) {
    throw new Error(`Restore requires typing confirmation phrase: ${RESTORE_CONFIRMATION_PHRASE}`);
  }

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  await writeCatalogToSupabase(plan.products);

  const imageResults = [];
  for (const image of plan.manifest.images) {
    imageResults.push(
      await uploadMissingImage(config, backupDir, image, !!options.overwriteImages)
    );
  }

  return {
    dryRun: false,
    productCount: plan.productCount,
    imageCount: plan.imageCount,
    catalogRestored: true,
    imageResults,
  };
}

export function askRestoreConfirmation(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
