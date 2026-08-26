import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "soul_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

type SessionPayload = {
  iat: number;
  exp: number;
};

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string; authenticated: false };

function readAdminPasscode(): string | null {
  const passcode = process.env.ADMIN_PASSCODE?.trim();
  return passcode || null;
}

function readSessionSecret(): string | null {
  const secret = process.env.CATALOG_SESSION_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminAuthConfigured(): boolean {
  return !!readAdminPasscode() && !!readSessionSecret();
}

export function validateAdminPasscode(passcode: string): boolean {
  const expected = readAdminPasscode();
  if (!expected) return false;

  const provided = Buffer.from(passcode);
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;
  return timingSafeEqual(provided, target);
}

function signPayload(payload: SessionPayload): string {
  const secret = readSessionSecret();
  if (!secret) throw new Error("CATALOG_SESSION_SECRET is not configured");

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifySignedToken(token: string): SessionPayload | null {
  const secret = readSessionSecret();
  if (!secret) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || typeof payload.iat !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSessionToken(now = Math.floor(Date.now() / 1000)): string {
  const payload: SessionPayload = {
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE_SECONDS,
  };
  return signPayload(payload);
}

export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return verifySignedToken(token) !== null;
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf("=");
    if (index <= 0) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function getAdminSessionTokenFromRequest(request: Request): string | null {
  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies[ADMIN_SESSION_COOKIE] ?? null;
}

export function requireAdminSession(request: Request): AdminAuthResult {
  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "Admin authentication is not configured.",
      authenticated: false,
    };
  }

  const token = getAdminSessionTokenFromRequest(request);
  if (!verifyAdminSessionToken(token)) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized.",
      authenticated: false,
    };
  }

  return { ok: true };
}

export function buildAdminSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function attachAdminSessionCookie(response: NextResponse, token: string): NextResponse {
  response.headers.append("Set-Cookie", buildAdminSessionCookie(token));
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
  return response;
}
