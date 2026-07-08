import { NextResponse } from "next/server";
import { deleteImage, isStorageImageUrl, supabaseServerConfig } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
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
