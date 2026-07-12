/**
 * Client-side helpers for perfume image upload/delete via API routes.
 */

import { slugify } from "@/lib/slug";

export function isStorageImageUrl(url: string): boolean {
  return url.includes("/storage/v1/object/") && url.includes("/perfumes/");
}

export function isBase64Image(url: string): boolean {
  return url.startsWith("data:image/");
}

export async function uploadPerfumeImage(file: File, slugHint?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (slugHint) formData.append("slug", slugHint);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Image upload failed");
  }
  if (!data?.url || typeof data.url !== "string") {
    throw new Error("Image upload returned an invalid URL");
  }
  return data.url;
}

export async function deletePerfumeImage(url: string): Promise<void> {
  if (!isStorageImageUrl(url)) return;

  const response = await fetch("/api/storage/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Image delete failed");
  }
}

export function slugFromName(name: string): string {
  return slugify(name);
}
