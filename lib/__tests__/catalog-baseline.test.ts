import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  BASELINE_FILE,
  BASELINE_MANIFEST_FILE,
  EXPECTED_BASELINE_PRODUCT_COUNT,
  loadCatalogBaselineManifest,
  loadCatalogBaselineProducts,
} from "../catalog-baseline";

describe("catalog baseline", () => {
  it("baseline files exist", () => {
    assert.doesNotThrow(() => readFileSync(BASELINE_FILE, "utf8"));
    assert.doesNotThrow(() => readFileSync(BASELINE_MANIFEST_FILE, "utf8"));
  });

  it("manifest declares exactly 103 products", () => {
    const manifest = loadCatalogBaselineManifest();
    assert.equal(manifest.productCount, 103);
    assert.equal(manifest.baselineVersion, "103-v1");
    assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  });

  it("baseline JSON is valid and contains exactly 103 products", () => {
    const products = loadCatalogBaselineProducts();
    assert.equal(products.length, EXPECTED_BASELINE_PRODUCT_COUNT);
  });

  it("baseline has no duplicate slugs", () => {
    const products = loadCatalogBaselineProducts();
    const slugs = products.map((product) => product.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("baseline products do not contain imageBackup fields", () => {
    const raw = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
    assert.ok(Array.isArray(raw.products));
    for (const product of raw.products) {
      assert.equal("imageBackup" in product, false);
    }
  });

  it("baseline products use Supabase Storage image URLs", () => {
    const products = loadCatalogBaselineProducts();
    for (const product of products) {
      assert.match(product.image, /\/storage\/v1\/object\/public\/perfumes\//);
    }
  });

  it("baseline contains no secret-like field names", () => {
    const raw = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
    const secretPatterns = [/secret/i, /password/i, /passcode/i, /token/i, /apikey/i, /service_role/i];
    for (const product of raw.products) {
      for (const key of Object.keys(product)) {
        assert.equal(secretPatterns.some((pattern) => pattern.test(key)), false, `unexpected field ${key}`);
      }
    }
  });
});
