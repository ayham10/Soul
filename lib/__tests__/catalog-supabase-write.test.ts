import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { writeSupabaseCatalog } from "../catalog-supabase-write";
import { EMPTY_CATALOG_WRITE_ERROR } from "../catalog-guard";
import { applyTestSupabaseEnv, sampleProduct } from "./helpers";

describe("writeSupabaseCatalog", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    applyTestSupabaseEnv();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mock.restoreAll();
  });

  it("rejects empty catalogs before calling Supabase", async () => {
    let fetchCalled = false;
    global.fetch = (async () => {
      fetchCalled = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    await assert.rejects(() => writeSupabaseCatalog([]), (error: Error) => {
      assert.equal(error.message, EMPTY_CATALOG_WRITE_ERROR);
      return true;
    });
    assert.equal(fetchCalled, false);
  });

  it("writes non-empty catalogs to Supabase", async () => {
    let requestUrl = "";
    global.fetch = (async (input) => {
      requestUrl = String(input);
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    await writeSupabaseCatalog([sampleProduct()]);
    assert.match(requestUrl, /\/rest\/v1\/soul_catalog/);
  });
});
