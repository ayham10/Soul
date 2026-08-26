import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/catalog-auth";
import { getRequestId, logSecurityRejection } from "@/lib/catalog-guard";
import { deleteImage, isStorageImageUrl, supabaseServerConfig } from "@/lib/storage";

export const dynamic = "force-dynamic";
const ENDPOINT = "DELETE /api/storage/delete";

export async function DELETE(request: Request) {
  const requestId = getRequestId(request);
  const auth = requireAdminSession(request);

  if (!auth.ok) {
    logSecurityRejection({
      endpoint: ENDPOINT,
      reason: auth.status === 503 ? "auth_not_configured" : "unauthorized",
      authenticated: false,
      requestId,
      event: "admin_access_rejected",
    });
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!supabaseServerConfig()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const url = body?.url;

  if (typeof url !== "string" || !url) {
    return NextResponse.json({ error: "Missing image URL." }, { status: 400 });
  }

  if (!isStorageImageUrl(url)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await deleteImage(url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
