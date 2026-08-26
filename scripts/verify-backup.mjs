#!/usr/bin/env node
import { resolve } from "path";
import { verifyBackupContents } from "./lib/manifest.mjs";

function parseArgs(argv) {
  const args = { backupDir: null, touchManifest: false };
  const positional = [];

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--touch-manifest") args.touchManifest = true;
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run verify:backup -- <backup-directory> [--touch-manifest]

Verifies a local backup directory without contacting Supabase.
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
  const result = verifyBackupContents(args.backupDir, { touchManifest: args.touchManifest });

  console.error(`Backup directory: ${args.backupDir}`);
  console.error(`Products: ${result.productCount ?? "unknown"}`);
  console.error(`Verified: ${result.verified}`);

  if (!result.verified) {
    console.error("Errors:");
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
