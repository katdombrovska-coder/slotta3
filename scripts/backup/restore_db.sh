#!/usr/bin/env bash
set -euo pipefail

# Slotta Restore Script (Postgres)
# Provider-agnostic: works anywhere pg_restore is available.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${ROOT_DIR}/scripts/backup/restore.log"

DRY_RUN=false
DUMP_FILE="${1:-}"

for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
  if [[ "$arg" == "--help" ]]; then
    echo "Usage: restore_db.sh <dump_file> [--dry-run]"
    exit 0
  fi
done

if [[ -z "$DUMP_FILE" ]]; then
  echo "[ERROR] dump_file is required" | tee -a "$LOG_FILE"
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[ERROR] DATABASE_URL is required" | tee -a "$LOG_FILE"
  exit 1
fi

if [[ "$DRY_RUN" == true ]]; then
  echo "[DRY-RUN] Would run: pg_restore --clean --if-exists --no-owner --dbname \"$DATABASE_URL\" \"$DUMP_FILE\"" | tee -a "$LOG_FILE"
  exit 0
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "[ERROR] pg_restore not found. Install Postgres client tools." | tee -a "$LOG_FILE"
  exit 1
fi

echo "[INFO] Starting restore from $DUMP_FILE" | tee -a "$LOG_FILE"

if pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" "$DUMP_FILE" >> "$LOG_FILE" 2>&1; then
  echo "[INFO] Restore completed" | tee -a "$LOG_FILE"
else
  echo "[ERROR] Restore failed" | tee -a "$LOG_FILE"
  exit 1
fi
