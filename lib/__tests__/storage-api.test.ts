import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import { createAdminSessionToken } from "../catalog-auth";
import { applyTestAuthEnv, applyTestSupabaseEnv, adminSessionCookie } from "./helpers";

const STORAGE_IMAGE_URL =
  "https://example.supabase.co/storage/v1/object/public/perfumes/existing-image.jpg";

describe("storage API routes", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    applyTestAuthEnv();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    mock.restoreAll();
  });

  it("rejects unauthenticated upload attempts", async () => {
    applyTestSupabaseEnv();
    const { POST } = await import("../../app/api/storage/upload/route");

    const formData = new FormData();
    formData.append("file", new File([new Uint8Array([1, 2, 3])], "test.jpg", { type: "image/jpeg" }));

    const response = await POST(
      new Request("http://localhost/api/storage/upload", {
        method: "POST",
        body: formData,
      })
    );

    assert.equal(response.status, 401);
  });

  it("rejects unauthenticated delete attempts", async () => {
    applyTestSupabaseEnv();
    const { DELETE } = await import("../../app/api/storage/delete/route");

    const response = await DELETE(
      new Request("http://localhost/api/storage/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: STORAGE_IMAGE_URL }),
      })
    );

    assert.equal(response.status, 401);
  });

  it("allows authenticated upload attempts when Supabase is configured", async () => {
    applyTestSupabaseEnv();
    global.fetch = (async () => new Response(null, { status: 200 })) as typeof fetch;

    const { POST } = await import("../../app/api/storage/upload/route");
    const token = createAdminSessionToken();
    const formData = new FormData();
    formData.append("file", new File([new Uint8Array([1, 2, 3])], "test.jpg", { type: "image/jpeg" }));
    formData.append("slug", "test-perfume");

    const response = await POST(
      new Request("http://localhost/api/storage/upload", {
        method: "POST",
        headers: { cookie: adminSessionCookie(token) },
        body: formData,
      })
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.match(body.url, /\/storage\/v1\/object\/public\/perfumes\//);
  });

  it("allows authenticated delete attempts for storage URLs", async () => {
    applyTestSupabaseEnv();
    global.fetch = (async () => new Response(null, { status: 200 })) as typeof fetch;

    const { DELETE } = await import("../../app/api/storage/delete/route");
    const token = createAdminSessionToken();

    const response = await DELETE(
      new Request("http://localhost/api/storage/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          cookie: adminSessionCookie(token),
        },
        body: JSON.stringify({ url: STORAGE_IMAGE_URL }),
      })
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
  });
});
