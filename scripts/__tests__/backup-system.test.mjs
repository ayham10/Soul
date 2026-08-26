import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import {
  assertNoSecretFields,
  validateCatalogProducts,
} from "../lib/catalog-schema.mjs";
import {
  collectUniqueStorageImages,
  attachImageBackupPaths,
} from "../lib/image-backup.mjs";
import {
  getStoragePathFromUrl,
  localImageBackupPath,
} from "../lib/storage-path.mjs";
import { sha256Buffer } from "../lib/checksum.mjs";
import {
  buildManifestDraft,
  verifyBackupContents,
  writeManifest,
} from "../lib/manifest.mjs";
import {
  buildRestorePlan,
  restoreBackup,
  RESTORE_CONFIRMATION_PHRASE,
  stripBackupOnlyFields,
} from "../lib/restore-backup-core.mjs";

const STORAGE_URL =
  "https://example.supabase.co/storage/v1/object/public/perfumes/angel-share.jpg";

function sampleProduct(overrides = {}) {
  return {
    slug: "angel-share",
    name: "Angel Share",
    price: 120,
    collection: "General",
    family: "Woody",
    gender: "Unisex",
    tagline: "Test",
    description: "Test",
    notes: { top: ["A"], heart: ["B"], base: ["C"] },
    image: STORAGE_URL,
    accent: "#000000",
    stock: 10,
    displayOrder: 0,
    bestseller: false,
    ...overrides,
  };
}

describe("backup catalog serialization", () => {
  it("preserves live product objects and rejects secret fields", () => {
    const products = [sampleProduct({ price50: 70 })];
    assertNoSecretFields(products);
    const serialized = JSON.stringify({ products });
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.products[0].price50, 70);
    assert.equal(parsed.products[0].slug, "angel-share");
  });

  it("rejects empty catalogs", () => {
    const result = validateCatalogProducts([]);
    assert.equal(result.ok, false);
  });
});

describe("storage path extraction", () => {
  it("extracts the Storage object path from a public URL", () => {
    assert.equal(getStoragePathFromUrl(STORAGE_URL), "angel-share.jpg");
    assert.equal(localImageBackupPath("angel-share.jpg"), "images/perfumes/angel-share.jpg");
  });

  it("deduplicates shared images across products", () => {
    const products = [
      sampleProduct({ slug: "a" }),
      sampleProduct({ slug: "b", name: "B" }),
    ];
    const map = collectUniqueStorageImages(products);
    assert.equal(map.size, 1);
    assert.deepEqual(map.get("angel-share.jpg")?.referencedBySlugs, ["a", "b"]);
  });
});

describe("backup verification", () => {
  it("detects missing images and checksum mismatches", () => {
    const backupDir = mkdtempSync(join(tmpdir(), "soul-backup-"));
    mkdirSync(join(backupDir, "images", "perfumes"), { recursive: true });

    const products = [
      {
        ...sampleProduct(),
        imageBackup: "images/perfumes/angel-share.jpg",
      },
    ];

    writeFileSync(join(backupDir, "catalog.json"), JSON.stringify({ products }, null, 2));

    const manifest = buildManifestDraft({
      backupDir,
      products,
      images: [
        {
          storagePath: "angel-share.jpg",
          originalUrl: STORAGE_URL,
          localPath: "images/perfumes/angel-share.jpg",
          downloaded: true,
          bytes: 3,
          sha256: "deadbeef",
        },
      ],
      failures: [],
    });
    writeManifest(backupDir, manifest);

    const missing = verifyBackupContents(backupDir);
    assert.equal(missing.verified, false);
    assert.ok(missing.errors.some((error) => error.includes("missing image file")));

    writeFileSync(join(backupDir, "images", "perfumes", "angel-share.jpg"), Buffer.from("abc"));
    const corrupted = verifyBackupContents(backupDir);
    assert.equal(corrupted.verified, false);
    assert.ok(corrupted.errors.some((error) => error.includes("checksum mismatch")));

    manifest.images[0].sha256 = sha256Buffer(Buffer.from("abc"));
    writeManifest(backupDir, manifest);
    const valid = verifyBackupContents(backupDir);
    assert.equal(valid.verified, true);
  });

  it("rejects invalid manifests", () => {
    const backupDir = mkdtempSync(join(tmpdir(), "soul-backup-"));
    mkdirSync(join(backupDir, "images", "perfumes"), { recursive: true });
    writeFileSync(join(backupDir, "catalog.json"), JSON.stringify({ products: [sampleProduct()] }, null, 2));
    writeFileSync(
      join(backupDir, "manifest.json"),
      JSON.stringify({ productCount: 99, images: [], failures: [] }, null, 2)
    );

    const result = verifyBackupContents(backupDir);
    assert.equal(result.verified, false);
    assert.ok(result.errors.length > 0);
  });
});

describe("restore safety", () => {
  it("supports dry-run without writes", () => {
    const backupDir = mkdtempSync(join(tmpdir(), "soul-backup-"));
    mkdirSync(join(backupDir, "images", "perfumes"), { recursive: true });
    const imageBytes = Buffer.from("image-bytes");
    writeFileSync(join(backupDir, "images", "perfumes", "angel-share.jpg"), imageBytes);

    const products = [
      {
        ...sampleProduct(),
        imageBackup: "images/perfumes/angel-share.jpg",
      },
    ];

    writeFileSync(join(backupDir, "catalog.json"), JSON.stringify({ products }, null, 2));
    const manifest = buildManifestDraft({
      backupDir,
      products,
      images: [
        {
          storagePath: "angel-share.jpg",
          originalUrl: STORAGE_URL,
          localPath: "images/perfumes/angel-share.jpg",
          downloaded: true,
          bytes: imageBytes.length,
          sha256: sha256Buffer(imageBytes),
        },
      ],
      failures: [],
    });
    writeManifest(backupDir, manifest);

    const plan = buildRestorePlan(backupDir);
    assert.equal(plan.ok, true);
    assert.equal(plan.productCount, 1);
    assert.equal(plan.imageCount, 1);
    assert.deepEqual(stripBackupOnlyFields(products)[0].imageBackup, undefined);
  });

  it("requires the explicit confirmation phrase constant", () => {
    assert.equal(RESTORE_CONFIRMATION_PHRASE, "RESTORE SOUL PERFUME");
  });

  it("requires confirmation before performing writes", async () => {
    const backupDir = mkdtempSync(join(tmpdir(), "soul-backup-"));
    mkdirSync(join(backupDir, "images", "perfumes"), { recursive: true });
    const imageBytes = Buffer.from("image-bytes");
    writeFileSync(join(backupDir, "images", "perfumes", "angel-share.jpg"), imageBytes);
    const products = [
      {
        ...sampleProduct(),
        imageBackup: "images/perfumes/angel-share.jpg",
      },
    ];
    writeFileSync(join(backupDir, "catalog.json"), JSON.stringify({ products }, null, 2));
    writeManifest(
      backupDir,
      buildManifestDraft({
        backupDir,
        products,
        images: [
          {
            storagePath: "angel-share.jpg",
            originalUrl: STORAGE_URL,
            localPath: "images/perfumes/angel-share.jpg",
            downloaded: true,
            bytes: imageBytes.length,
            sha256: sha256Buffer(imageBytes),
          },
        ],
        failures: [],
      })
    );

    await assert.rejects(
      () => restoreBackup(backupDir, { dryRun: false, confirm: false }),
      /requires --confirm/
    );
    await assert.rejects(
      () => restoreBackup(backupDir, { dryRun: false, confirm: true, confirmPhrase: "NOPE" }),
      /confirmation phrase/
    );
  });
});

describe("independent catalog paths", () => {
  it("adds imageBackup while preserving the original image URL", () => {
    const products = [sampleProduct()];
    const map = collectUniqueStorageImages(products);
    const enriched = attachImageBackupPaths(products, map);
    assert.equal(enriched[0].image, STORAGE_URL);
    assert.equal(enriched[0].imageBackup, "images/perfumes/angel-share.jpg");
  });
});
