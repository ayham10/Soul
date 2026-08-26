import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { createAdminSessionToken } from "../catalog-auth";
import { EMPTY_CATALOG_ERROR } from "../catalog-guard";
import { prepareCatalog, reorderBySlugs, swapDisplayOrder } from "../inventory";
import { products as seedProducts } from "../products";
import { applyTestAuthEnv, adminSessionCookie, sampleProduct } from "./helpers";

describe("catalog operations", () => {
  beforeEach(() => {
    applyTestAuthEnv();
  });

  it("still supports add semantics with a non-empty catalog", () => {
    const existing = sampleProduct({ slug: "existing", displayOrder: 0 });
    const added = sampleProduct({ slug: "new-item", name: "New Item", displayOrder: 1 });
    const next = prepareCatalog([...prepareCatalog([existing]), added]);
    assert.equal(next.length, 2);
    assert.ok(next.some((product) => product.slug === "new-item"));
  });

  it("still supports update semantics with a non-empty catalog", () => {
    const original = sampleProduct({ slug: "item-a", name: "Original" });
    const updated = sampleProduct({ slug: "item-a", name: "Updated Name" });
    const next = prepareCatalog([original]).map((product) =>
      product.slug === "item-a" ? updated : product
    );
    assert.equal(next[0]?.name, "Updated Name");
    assert.equal(next.length, 1);
  });

  it("still supports reordering without emptying the catalog", () => {
    const products = prepareCatalog([
      sampleProduct({ slug: "a", displayOrder: 0 }),
      sampleProduct({ slug: "b", displayOrder: 1, name: "Second" }),
      sampleProduct({ slug: "c", displayOrder: 2, name: "Third" }),
    ]);
    const moved = swapDisplayOrder(products, "b", "up");
    assert.equal(moved.length, 3);
    assert.equal(moved[0]?.slug, "b");

    const reordered = reorderBySlugs(products, ["c", "a", "b"]);
    assert.equal(reordered.length, 3);
    assert.deepEqual(reordered.map((product) => product.slug), ["c", "a", "b"]);
  });

  it("still supports reset semantics using the non-empty seed catalog", () => {
    const resetCatalog = prepareCatalog(seedProducts);
    assert.ok(resetCatalog.length > 0);
  });
});

describe("PUT /api/products", () => {
  let PUT: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    applyTestAuthEnv();
    ({ PUT } = await import("../../app/api/products/route"));
  });

  afterEach(() => {
    delete (global as { fetch?: typeof fetch }).fetch;
  });

  it("rejects unauthenticated writes", async () => {
    const response = await PUT(
      new Request("http://localhost/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: [sampleProduct()] }),
      })
    );
    assert.equal(response.status, 401);
  });

  it("rejects empty catalogs with HTTP 400", async () => {
    const token = createAdminSessionToken();
    const response = await PUT(
      new Request("http://localhost/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: adminSessionCookie(token),
        },
        body: JSON.stringify({ products: [] }),
      })
    );
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, EMPTY_CATALOG_ERROR);
  });

  it("accepts authenticated non-empty catalog writes", async () => {
    const token = createAdminSessionToken();
    const response = await PUT(
      new Request("http://localhost/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: adminSessionCookie(token),
        },
        body: JSON.stringify({ products: [sampleProduct()] }),
      })
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.products.length, 1);
    assert.equal(body.storage, "filesystem");
  });
});
