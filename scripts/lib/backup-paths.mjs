import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export function getBackupRoot() {
  return join(process.cwd(), "backups");
}

export function formatBackupDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function resolveBackupDir(dateStr, { allowExisting = false } = {}) {
  const root = getBackupRoot();
  let dir = join(root, dateStr);

  if (existsSync(dir) && !allowExisting) {
    const now = new Date();
    const suffix = now.toISOString().replace(/[:.]/g, "-").slice(11, 19);
    dir = join(root, `${dateStr}_${suffix}`);
  }

  return dir;
}

export function ensureBackupLayout(backupDir) {
  mkdirSync(join(backupDir, "images", "perfumes"), { recursive: true });
}

export function catalogPath(backupDir) {
  return join(backupDir, "catalog.json");
}

export function manifestPath(backupDir) {
  return join(backupDir, "manifest.json");
}

export function localImageAbsolutePath(backupDir, relativePath) {
  return join(backupDir, relativePath);
}
