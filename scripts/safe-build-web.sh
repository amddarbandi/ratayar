#!/usr/bin/env bash
# Safe Next.js build for the web app.
#
# Behavior:
#  - if .next exists, rename to .next.bak (site keeps serving from it)
#  - run next build
#  - on success: remove .next.bak, restart pm2 web
#  - on failure: restore .next.bak, DO NOT restart pm2 — site stays up
#
# Usage:  bash scripts/safe-build-web.sh
# Exit:   0 on success, non-zero on failure

set -u
APP=/var/www/zarvan/apps/web
BUILD_DIR="$APP/.next"
BACKUP_DIR="$APP/.next.bak"
LOG=/var/www/zarvan/logs/safe-build.log

mkdir -p /var/www/zarvan/logs
echo "════════ $(date '+%F %T') ════════" | tee -a "$LOG"

cd "$APP" || exit 1

# 1. move current build aside
if [ -d "$BUILD_DIR" ]; then
  rm -rf "$BACKUP_DIR"
  mv "$BUILD_DIR" "$BACKUP_DIR"
  echo "→ current .next moved to .next.bak" | tee -a "$LOG"
fi

# 2. build
CI=true NODE_ENV=production pnpm run build 2>&1 | tee -a "$LOG"
BUILD_EXIT=${PIPESTATUS[0]}

# 3. verify BUILD_ID exists
if [ "$BUILD_EXIT" -ne 0 ] || [ ! -f "$BUILD_DIR/BUILD_ID" ]; then
  echo "❌ build FAILED (exit $BUILD_EXIT) — rolling back" | tee -a "$LOG"
  rm -rf "$BUILD_DIR"
  if [ -d "$BACKUP_DIR" ]; then
    mv "$BACKUP_DIR" "$BUILD_DIR"
    echo "→ restored .next from backup; site unchanged" | tee -a "$LOG"
  else
    echo "⚠️  no backup to restore" | tee -a "$LOG"
  fi
  exit 1
fi

# 4. success — drop backup and restart
echo "✅ build OK — removing .next.bak" | tee -a "$LOG"
rm -rf "$BACKUP_DIR"
pm2 restart zarvan-web | tee -a "$LOG"
echo "✅ deployed" | tee -a "$LOG"
exit 0
