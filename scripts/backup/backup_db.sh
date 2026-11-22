#!/usr/bin/env bash
set -euo pipefail

# Slotta Backup Script (Postgres)
# Provider-agnostic: works anywhere pg_dump is available.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${ROOT_DIR}/scripts/backup/backup.log"

BACKUP_DIR="${BACKUP_STORAGE_PATH:-./backups}"
DRY_RUN=false

for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
  if [[ "$arg" == "--help" ]]; then
    echo "Usage: backup_db.sh [--dry-run]"
    exit 0
  fi
done

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
DUMP_FILE="${BACKUP_DIR}/slotta_backup_${TIMESTAMP}.dump"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL is required" | tee -a "$LOG_FILE"
  exit 1
fi

if [[ "$DRY_RUN" == true ]]; then
  echo "[DRY-RUN] Would run: pg_dump \"$DATABASE_URL\" --format=custom --file \"$DUMP_FILE\"" | tee -a "$LOG_FILE"
  exit 0
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[ERROR] pg_dump not found. Install Postgres client tools." | tee -a "$LOG_FILE"
  exit 1
fi

echo "[INFO] Starting backup to $DUMP_FILE" | tee -a "$LOG_FILE"

if pg_dump "$DATABASE_URL" --format=custom --file "$DUMP_FILE" >> "$LOG_FILE" 2>&1; then
  echo "[INFO] Backup completed" | tee -a "$LOG_FILE"
else
  echo "[ERROR] Backup failed" | tee -a "$LOG_FILE"
  exit 1
fi
