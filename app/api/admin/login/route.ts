import { NextResponse } from "next/server";
import {
  attachAdminSessionCookie,
  clearAdminSessionCookie,
  createAdminSessionToken,
  getAdminSessionTokenFromRequest,
  isAdminAuthConfigured,
  validateAdminPasscode,
  verifyAdminSessionToken,
} from "@/lib/catalog-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ authenticated: false, configured: false });
  }

  const token = getAdminSessionTokenFromRequest(request);
  return NextResponse.json({
    authenticated: verifyAdminSessionToken(token),
    configured: true,
  });
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin authentication is not configured." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  if (!validateAdminPasscode(passcode)) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  return attachAdminSessionCookie(response, token);
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  return clearAdminSessionCookie(response);
}
