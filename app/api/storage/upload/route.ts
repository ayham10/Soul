import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/catalog-auth";
import { getRequestId, logSecurityRejection } from "@/lib/catalog-guard";
import {
  extensionFromMime,
  generateImageFilename,
  supabaseServerConfig,
  uploadImage,
} from "@/lib/storage";

export const dynamic = "force-dynamic";
const ENDPOINT = "POST /api/storage/upload";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

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

  if (!supabaseServerConfig()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type.toLowerCase())) {
    return NextResponse.json({ error: "Unsupported image type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 5 MB)." }, { status: 400 });
  }

  const slugHint = String(formData?.get("slug") || "perfume")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "perfume";

  const contentType = file.type || `image/${extensionFromMime(file.name.split(".").pop() || "jpg")}`;
  const filename = generateImageFilename(slugHint, contentType);
  const buffer = new Uint8Array(await file.arrayBuffer());

  try {
    const url = await uploadImage(buffer, filename, contentType);
    return NextResponse.json({ url, path: `perfumes/${filename}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
