import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertCanRemoveFromCatalog, LAST_PRODUCT_DELETE_ERROR } from "../catalog-remove";
import { sampleProduct } from "./helpers";

describe("catalog-remove", () => {
  it("rejects deleting the last remaining product", () => {
    assert.throws(() => assertCanRemoveFromCatalog(1), (error: Error) => {
      assert.equal(error.message, LAST_PRODUCT_DELETE_ERROR);
      return true;
    });
  });

  it("allows deleting when more than one product remains", () => {
    assert.doesNotThrow(() => assertCanRemoveFromCatalog(2));
    assert.doesNotThrow(() => assertCanRemoveFromCatalog(103));
  });

  it("still allows deleting a normal product from a multi-item catalog", () => {
    const products = [
      sampleProduct({ slug: "keep-me" }),
      sampleProduct({ slug: "delete-me", name: "Delete Me" }),
    ];
    assertCanRemoveFromCatalog(products.length);
    const next = products.filter((product) => product.slug !== "delete-me");
    assert.equal(next.length, 1);
    assert.equal(next[0]?.slug, "keep-me");
  });
});
