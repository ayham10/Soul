# SoulPerfume disaster-recovery backups

Independent, offline backups of the live Supabase catalog and every referenced Storage image.

## Layout

```
backups/
  YYYY-MM-DD/
    catalog.json
    manifest.json
    images/
      perfumes/
        ...
```

Dated backups are never overwritten automatically. If `backups/YYYY-MM-DD/` already exists, a timestamp suffix is appended.

## Commands

```bash
# Full backup (catalog + images + manifest + verification)
npm run backup

# Read-only catalog fallback when Supabase credentials are unavailable locally
npm run backup -- --catalog-url https://soul-green.vercel.app/api/products

# Verify an existing backup (local only — no Supabase contact)
npm run verify:backup -- backups/YYYY-MM-DD

# Restore dry-run (zero writes)
npm run restore:backup -- backups/YYYY-MM-DD --dry-run

# Actual restore (requires --confirm and typing RESTORE SOUL PERFUME)
npm run restore:backup -- backups/YYYY-MM-DD --confirm
```

## Requirements

- `SUPABASE_URL` + `SUPABASE_SECRET_KEY` for direct Supabase catalog reads and restores
- Public Storage URLs are used for image downloads (read-only)
- Backup files never contain secrets

## Git

Backup directories are gitignored. Do not commit live catalog exports or downloaded images.
