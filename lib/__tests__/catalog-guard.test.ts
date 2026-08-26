import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_CATALOG_ERROR,
  EMPTY_CATALOG_WRITE_ERROR,
  assertNonEmptyCatalog,
} from "../catalog-guard";

describe("catalog-guard", () => {
  it("rejects empty catalogs via assertNonEmptyCatalog", () => {
    assert.throws(() => assertNonEmptyCatalog([]), (error: Error) => {
      assert.equal(error.message, EMPTY_CATALOG_WRITE_ERROR);
      return true;
    });
  });

  it("allows non-empty catalogs via assertNonEmptyCatalog", () => {
    assert.doesNotThrow(() => assertNonEmptyCatalog([{ slug: "a" }]));
  });

  it("exports a user-facing empty catalog error message", () => {
    assert.match(EMPTY_CATALOG_ERROR, /cannot be empty/i);
  });
});
