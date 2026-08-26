import { existsSync, writeFileSync } from "fs";
import { sha256Buffer } from "./checksum.mjs";
import {
  getStoragePathFromUrl,
  isStorageImageUrl,
  localImageBackupPath,
} from "./storage-path.mjs";
import { localImageAbsolutePath } from "./backup-paths.mjs";

export function collectUniqueStorageImages(products) {
  const map = new Map();

  for (const product of products) {
    const imageUrl = product.image;
    if (!isStorageImageUrl(imageUrl)) {
      continue;
    }

    const storagePath = getStoragePathFromUrl(imageUrl);
    if (!storagePath) continue;

    const existing = map.get(storagePath) || {
      storagePath,
      originalUrl: imageUrl,
      localPath: localImageBackupPath(storagePath),
      referencedBySlugs: [],
    };

    existing.referencedBySlugs.push(product.slug);
    map.set(storagePath, existing);
  }

  return map;
}

export async function downloadImageToBackup(backupDir, imageEntry) {
  const absolutePath = localImageAbsolutePath(backupDir, imageEntry.localPath);

  if (existsSync(absolutePath)) {
    const { readFileSync } = await import("fs");
    const buffer = readFileSync(absolutePath);
    return {
      ...imageEntry,
      downloaded: true,
      skippedExisting: true,
      bytes: buffer.length,
      sha256: sha256Buffer(buffer),
    };
  }

  const response = await fetch(imageEntry.originalUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`download failed (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(absolutePath, buffer);

  return {
    ...imageEntry,
    downloaded: true,
    skippedExisting: false,
    bytes: buffer.length,
    sha256: sha256Buffer(buffer),
  };
}

export function attachImageBackupPaths(products, imageMap) {
  return products.map((product) => {
    const next = { ...product };
    if (!isStorageImageUrl(product.image)) {
      next.imageBackup = null;
      return next;
    }

    const storagePath = getStoragePathFromUrl(product.image);
    const entry = storagePath ? imageMap.get(storagePath) : null;
    next.imageBackup = entry?.localPath ?? null;
    return next;
  });
}

export async function backupImagesForCatalog(backupDir, products) {
  const imageMap = collectUniqueStorageImages(products);
  const images = [];
  const failures = [];

  for (const entry of imageMap.values()) {
    try {
      const saved = await downloadImageToBackup(backupDir, entry);
      images.push(saved);
    } catch (error) {
      failures.push({
        storagePath: entry.storagePath,
        originalUrl: entry.originalUrl,
        localPath: entry.localPath,
        error: error instanceof Error ? error.message : "download failed",
      });
    }
  }

  return {
    images,
    failures,
    productsWithBackupPaths: attachImageBackupPaths(products, imageMap),
  };
}
