export const PERFUME_BUCKET = "perfumes";

export function isStorageImageUrl(url) {
  return (
    typeof url === "string" &&
    url.includes("/storage/v1/object/") &&
    url.includes(`/${PERFUME_BUCKET}/`)
  );
}

export function getStoragePathFromUrl(url) {
  if (typeof url !== "string") return null;
  const match = url.match(new RegExp(`/${PERFUME_BUCKET}/(.+)$`));
  if (!match) return null;
  return decodeURIComponent(match[1].split("?")[0]);
}

export function sanitizeBackupRelativePath(storagePath) {
  return storagePath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\./g, "");
}

export function localImageBackupPath(storagePath) {
  return `images/perfumes/${sanitizeBackupRelativePath(storagePath)}`;
}

export function getPublicStorageUrl(supabaseUrl, storagePath) {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${PERFUME_BUCKET}/${sanitizeBackupRelativePath(storagePath)}`;
}
