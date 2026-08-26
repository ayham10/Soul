import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { createAdminSessionToken } from "../catalog-auth";
import { EXPECTED_BASELINE_PRODUCT_COUNT } from "../catalog-baseline";
import { applyTestSupabaseEnv, adminSessionCookie } from "./helpers";

describe("baseline restore API", () => {
  let GET: (request: Request) => Promise<Response>;
  let POST: (request: Request) => Promise<Response>;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    applyTestSupabaseEnv();
    ({ GET, POST } = await import("../../app/api/admin/baseline-restore/route"));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("GET returns baseline metadata", async () => {
    const response = await GET(new Request("http://localhost/api/admin/baseline-restore"));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.productCount, EXPECTED_BASELINE_PRODUCT_COUNT);
    assert.equal(body.baselineVersion, "103-v1");
    assert.equal(body.confirmationPhrase, "RESET TO 103 BASELINE");
  });

  it("POST rejects unauthenticated restore attempts", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/baseline-restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: [] }),
      })
    );
    assert.equal(response.status, 401);
  });

  it("POST restores the server-side baseline and ignores client catalog payloads", async () => {
    let writeCount = 0;
    let writtenProducts: unknown = null;

    global.fetch = (async (_input, init) => {
      writeCount += 1;
      if (init?.body) {
        writtenProducts = JSON.parse(String(init.body));
      }
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    const token = createAdminSessionToken();
    const response = await POST(
      new Request("http://localhost/api/admin/baseline-restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: adminSessionCookie(token),
        },
        body: JSON.stringify({ products: [{ slug: "client-provided-only" }] }),
      })
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.productCount, EXPECTED_BASELINE_PRODUCT_COUNT);
    assert.equal(body.source, "catalog-baseline");
    assert.equal(writeCount, 1);
    assert.ok(Array.isArray((writtenProducts as { products?: unknown[] })?.products));
    assert.equal((writtenProducts as { products: unknown[] }).products.length, EXPECTED_BASELINE_PRODUCT_COUNT);
  });
});
