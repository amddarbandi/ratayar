#!/bin/bash
set -e

APP="${1:-web}"
cd "/var/www/zarvan/apps/$APP"

echo "🚀 Deploying $APP..."

# 1. Build
echo "📦 Building..."
if ! pnpm build 2>&1 | tee /tmp/build-$APP.log | tail -5; then
  echo "❌ Build failed! Not restarting. Previous version still running."
  exit 1
fi

# 2. Verify .next/BUILD_ID exists (for web)
if [ "$APP" = "web" ]; then
  if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ Build ID missing! Aborting restart."
    exit 1
  fi
fi

# 3. Restart
echo "🔄 Restarting..."
pm2 restart zarvan-$APP --update-env

# 4. Wait & verify
sleep 5
if pm2 describe zarvan-$APP | grep -q "online"; then
  echo "✅ $APP deployed successfully!"
else
  echo "❌ $APP failed to start!"
  pm2 logs zarvan-$APP --lines 20 --nostream
  exit 1
fi
