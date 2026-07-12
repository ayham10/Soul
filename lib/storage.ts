/**
 * Supabase Storage helpers — server-side only (uses secret key).
 */

export const PERFUME_BUCKET = "perfumes";

export function supabaseServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && secretKey
    ? { url: url.replace(/\/$/, ""), secretKey }
    : null;
}

function supabaseHeaders(config: NonNullable<ReturnType<typeof supabaseServerConfig>>) {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
  };
}

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionFromMime(mime: string): string {
  return MIME_EXT[mime.toLowerCase()] || "jpg";
}

export function generateImageFilename(slug: string, mime: string): string {
  const safe = slug.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").slice(0, 48) || "perfume";
  return `${safe}-${Date.now()}.${extensionFromMime(mime)}`;
}

export function isBase64Image(value: string): boolean {
  return value.startsWith("data:image/");
}

export function isLocalImagePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//");
}

export function isStorageImageUrl(value: string): boolean {
  return value.includes("/storage/v1/object/") && value.includes(`/${PERFUME_BUCKET}/`);
}

export function getStoragePathFromUrl(url: string): string | null {
  const match = url.match(new RegExp(`/${PERFUME_BUCKET}/(.+)$`));
  if (!match) return null;
  return decodeURIComponent(match[1].split("?")[0]);
}

export function getPublicUrl(path: string): string {
  const config = supabaseServerConfig();
  if (!config) throw new Error("Supabase is not configured");
  return `${config.url}/storage/v1/object/public/${PERFUME_BUCKET}/${path}`;
}

export async function uploadImage(
  file: Uint8Array,
  filename: string,
  contentType: string
): Promise<string> {
  const config = supabaseServerConfig();
  if (!config) throw new Error("Supabase is not configured");

  const path = filename.replace(/^\/+/, "");
  const url = `${config.url}/storage/v1/object/${PERFUME_BUCKET}/${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...supabaseHeaders(config),
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Blob([new Uint8Array(file)], { type: contentType }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image upload failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }

  return getPublicUrl(path);
}

export async function deleteImage(urlOrPath: string): Promise<void> {
  if (!isStorageImageUrl(urlOrPath)) return;

  const config = supabaseServerConfig();
  if (!config) throw new Error("Supabase is not configured");

  const objectPath = getStoragePathFromUrl(urlOrPath);
  if (!objectPath) return;

  const url = `${config.url}/storage/v1/object/${PERFUME_BUCKET}/${objectPath}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: supabaseHeaders(config),
  });

  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image delete failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
}

/** Replace legacy Base64 image strings so the catalogue payload stays small. */
export function sanitizeProductImage(image: string): string {
  if (isBase64Image(image)) return "/images/hero.png";
  return image;
}
