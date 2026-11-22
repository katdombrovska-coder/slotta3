# Slotta Backup Scripts

These scripts provide a lightweight, provider-agnostic Postgres backup and restore flow.
They use `pg_dump` and `pg_restore`, so they run the same on Railway, Render, or DigitalOcean.

## Environment

Required:
- `DATABASE_URL` (Postgres connection string)

Optional:
- `BACKUP_STORAGE_PATH` (default: `./backups`)

## Backup

```bash
./scripts/backup/backup_db.sh
```

Dry-run:
```bash
./scripts/backup/backup_db.sh --dry-run
```

## Restore

```bash
./scripts/backup/restore_db.sh ./backups/slotta_backup_YYYYMMDD_HHMMSS.dump
```

Dry-run:
```bash
./scripts/backup/restore_db.sh ./backups/slotta_backup_YYYYMMDD_HHMMSS.dump --dry-run
```

## Logs

- `scripts/backup/backup.log`
- `scripts/backup/restore.log`
