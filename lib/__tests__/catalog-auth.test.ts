import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  buildAdminSessionCookie,
  createAdminSessionToken,
  requireAdminSession,
  validateAdminPasscode,
  verifyAdminSessionToken,
} from "../catalog-auth";
import { applyTestAuthEnv, adminSessionCookie, TEST_ADMIN_PASSCODE } from "./helpers";

describe("catalog-auth", () => {
  beforeEach(() => {
    applyTestAuthEnv();
  });

  it("validates the configured admin passcode", () => {
    assert.equal(validateAdminPasscode(TEST_ADMIN_PASSCODE), true);
    assert.equal(validateAdminPasscode("wrong"), false);
  });

  it("creates and verifies a signed admin session token", () => {
    const token = createAdminSessionToken();
    assert.equal(verifyAdminSessionToken(token), true);
    assert.equal(verifyAdminSessionToken("invalid.token"), false);
  });

  it("requires a valid session cookie on protected requests", () => {
    const token = createAdminSessionToken();
    const authorized = requireAdminSession(
      new Request("http://localhost/api/products", {
        headers: { cookie: adminSessionCookie(token) },
      })
    );
    assert.equal(authorized.ok, true);

    const unauthorized = requireAdminSession(new Request("http://localhost/api/products"));
    assert.equal(unauthorized.ok, false);
    if (!unauthorized.ok) {
      assert.equal(unauthorized.status, 401);
    }
  });

  it("builds an HttpOnly session cookie", () => {
    const cookie = buildAdminSessionCookie("token-value");
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.match(cookie, /soul_admin_session=/);
  });
});
