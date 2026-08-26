#!/usr/bin/env node
import { resolve } from "path";
import {
  askRestoreConfirmation,
  restoreBackup,
  RESTORE_CONFIRMATION_PHRASE,
} from "./lib/restore-backup-core.mjs";

function parseArgs(argv) {
  const args = {
    backupDir: null,
    dryRun: false,
    confirm: false,
    overwriteImages: false,
  };
  const positional = [];

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--confirm") args.confirm = true;
    else if (arg === "--overwrite-images") args.overwriteImages = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run restore:backup -- <backup-directory> [--dry-run] [--confirm] [--overwrite-images]

Dry-run performs zero writes.
Actual restore requires --confirm and typing: ${RESTORE_CONFIRMATION_PHRASE}
`);
      process.exit(0);
    } else {
      positional.push(arg);
    }
  }

  if (!positional[0]) {
    throw new Error("Missing required <backup-directory>");
  }

  args.backupDir = resolve(process.cwd(), positional[0]);
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.dryRun) {
    const result = await restoreBackup(args.backupDir, { dryRun: true });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!args.confirm) {
    throw new Error("Actual restore requires --confirm");
  }

  const typed = await askRestoreConfirmation(
    `Type "${RESTORE_CONFIRMATION_PHRASE}" to restore ${args.backupDir}: `
  );

  const result = await restoreBackup(args.backupDir, {
    dryRun: false,
    confirm: true,
    confirmPhrase: typed,
    overwriteImages: args.overwriteImages,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
