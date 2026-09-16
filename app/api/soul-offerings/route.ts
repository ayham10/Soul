import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/catalog-auth";
import { getRequestId, logSecurityRejection } from "@/lib/catalog-guard";
import {
  normalizeOfferingsList,
  readOfferingsCatalog,
  writeOfferingsCatalog,
} from "@/lib/offerings-persistence";
import { isBase64Image } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { offerings, storage } = await readOfferingsCatalog();
    return NextResponse.json(
      { offerings, storage },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load offerings";
    return NextResponse.json({ error: message, offerings: [], storage: "supabase" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const endpoint = "PUT /api/soul-offerings";
  const requestId = getRequestId(request);
  const auth = requireAdminSession(request);

  if (!auth.ok) {
    logSecurityRejection({
      endpoint,
      reason: auth.status === 503 ? "auth_not_configured" : "unauthorized",
      authenticated: false,
      requestId,
      event: "admin_access_rejected",
    });
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const offerings = body?.offerings;

  if (!Array.isArray(offerings)) {
    return NextResponse.json({ error: "Invalid offerings payload." }, { status: 400 });
  }

  const normalized = normalizeOfferingsList(offerings);
  if (!normalized) {
    return NextResponse.json(
      { error: "Invalid offerings payload. Each item needs title, description, image, status, and CTA text." },
      { status: 400 }
    );
  }

  if (normalized.some((item) => isBase64Image(item.image))) {
    return NextResponse.json(
      { error: "Offerings contain embedded Base64 images. Upload images to Storage first, then save again." },
      { status: 413 }
    );
  }

  try {
    const storage = await writeOfferingsCatalog(normalized);
    return NextResponse.json(
      { offerings: normalized, storage },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Offerings save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
