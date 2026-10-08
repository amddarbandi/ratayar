# Outage log

Every user-visible outage is recorded here. Purpose: prevent recurrence.

## 2026-10-08 — Web 502 due to pnpm install removing devDependencies

Cause:
- Ran `pnpm install --force` on production with NODE_ENV=production.
- pnpm silently removed 417 devDependencies, including autoprefixer.
- The next Next.js build failed: "Cannot find module 'autoprefixer'"
  plus cascading "Module not found: '@/lib/api'" errors.
- pm2 web went to errored state (BUILD_ID missing, restart loop).

Timeline:
- 17:34 — first web-error.log entries
- ~17:34-20:25 — multiple failed attempts to reinstall
- 20:25 — build succeeded after recovery install + type fix

Recovery:
- `pkill -9 node npm pnpm`
- `CI=true NODE_ENV=development pnpm install --frozen-lockfile`
- Add missing type declaration for jalaali-js (see commit)
- Rebuild web; pm2 restart; smoke test 200

Prevention:
- CONTRIBUTING.md "Outage prevention rules" added:
  Rule 1: no bare pnpm/npm install on production
  Rule 2: no pm2 restart without .next/BUILD_ID
  Rule 3: build -> restart -> smoke -> commit -> push
  Rule 4: small commits only
  Rule 5: this log

Lesson: type declarations must be added the moment a new untyped
dependency enters the codebase, not when the build breaks.
