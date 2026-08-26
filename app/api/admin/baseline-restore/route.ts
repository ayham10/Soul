import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/catalog-auth";
import {
  CatalogBaselineError,
  getCatalogBaselineInfo,
  loadCatalogBaselineManifest,
  loadCatalogBaselineProducts,
} from "@/lib/catalog-baseline";
import { assertNonEmptyCatalog, getRequestId, logSecurityRejection } from "@/lib/catalog-guard";
import { writeSupabaseCatalog } from "@/lib/catalog-supabase-write";

export const dynamic = "force-dynamic";

const ENDPOINT = "POST /api/admin/baseline-restore";

function supabaseConfigured() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && secretKey);
}

export async function GET() {
  try {
    const info = getCatalogBaselineInfo();
    return NextResponse.json(info);
  } catch (error) {
    const message = error instanceof CatalogBaselineError ? error.message : "Baseline unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  if (!supabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Baseline restore requires Supabase." },
      { status: 503 }
    );
  }

  // Explicitly ignore any client-provided catalog payload.
  await request.json().catch(() => null);

  try {
    const manifest = loadCatalogBaselineManifest();
    const products = loadCatalogBaselineProducts();
    assertNonEmptyCatalog(products);

    await writeSupabaseCatalog(products);

    return NextResponse.json({
      ok: true,
      productCount: products.length,
      baselineVersion: manifest.baselineVersion,
      source: "catalog-baseline",
    });
  } catch (error) {
    if (error instanceof CatalogBaselineError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Baseline restore failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
