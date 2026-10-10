# Contributing to Ratayar

> Mandatory workflow. Code changes without docs updates will not be merged.

## Golden rule

Every code change = one commit + corresponding docs update.

## Pre-commit checklist

- [ ] Code changed and tested
- [ ] npx tsc --noEmit: zero errors
- [ ] pnpm build: success
- [ ] pm2 logs: no new errors
- [ ] Entry added to docs/CHANGELOG.md under [Unreleased]
- [ ] Entry added to docs/KNOWN-ISSUES.md if bug-related
- [ ] Commit message follows format
- [ ] git push done

## Commit message format

TYPE(SCOPE): SUBJECT

BODY

Fix:
- change 1
- change 2

Resolves: ID

Types: fix, feat, docs, refactor, chore, test.

Example:

fix(api): validate UUID in documents.findOne

Prisma throws on invalid UUIDs.

Fix:
- add ParseUUIDPipe on @Param('id')

Resolves: API-001

## Docs structure

- docs/CHANGELOG.md - always
- docs/KNOWN-ISSUES.md - new/resolved bug
- docs/ARCHITECTURE.md - architecture change
- docs/QUICKSTART.md - setup change

## Issue ID prefixes

- SEC-NNN: security
- API-NNN: backend
- WEB-NNN: frontend
- PWA-NNN: service worker
- DB-NNN: database
- BUILD-NNN: infrastructure

## Git flow

- main: production
- feat/NAME: new feature
- fix/NAME: bug fix
- hotfix/NAME: urgent main fix

## Definition of Done

1. Code tested and built
2. CHANGELOG + KNOWN-ISSUES updated
3. Standard commit message
4. Pushed to remote

## Forbidden

- Commit without message
- Commit without CHANGELOG
- Direct push to main
- .env or secrets in repo
- dist/ or node_modules/ in git

Last updated: 2026-10-08

## Outage prevention rules

### Rule 1 — Never run pnpm/npm install on production without env guard

Forbidden on production:
- pnpm install
- pnpm install --force
- npm install
- pnpm install --no-frozen-lockfile

Why: pnpm respects NODE_ENV=production and silently removes every
devDependency (autoprefixer, postcss plugins, ts-node...). The next
build fails and pm2 web goes errored.

If deps really must change:
  CI=true NODE_ENV=development pnpm install --frozen-lockfile

After any install: verify autoprefixer exists in node_modules before
touching anything else.

### Rule 2 — Never restart pm2 before .next/BUILD_ID exists

check: ls apps/web/.next/BUILD_ID

If missing: do not restart. Rollback the offending commit and rebuild.

### Rule 3 — Build first, then commit, then push

Sequence:
  1. edit files
  2. pnpm build locally / turbo run build --filter=...
  3. verify BUILD_ID exists
  4. pm2 restart (if API, also verify /api/health)
  5. curl smoke test (200 on affected routes)
  6. git commit
  7. git push

Never commit code that has not been built and smoked on this server.

### Rule 4 — Small blocks only

No commit should touch more than 2-3 files unless it is a pure docs
commit. Multi-file refactors must be split across multiple commits,
each fully verified before the next.

### Rule 5 — Outage log

Any user-visible outage (502, pm2 errored, blank page) must be logged
in docs/OUTAGES.md with: cause, timeline, fix commit, prevention rule
added.

UI consistency rules (see docs/UI-GUIDELINES.md)
Same visual language everywhere — dark glass theme, neon accents.

No light backgrounds on any authenticated page.

Use shared UI components (Card, Button, Input, Modal). Never raw
divs for surfaces.

Every page must be verified visually, not just curl 200.

Homepage is the shop window — must show a live dashboard preview.

Any UI drift must be fixed in the next commit.

Full rules: docs/UI-GUIDELINES.md

## Rule — Web build must use safe-build script

Never run `turbo run build` or `pnpm run build` on the web app
directly. Always use:

    bash /var/www/zarvan/scripts/safe-build-web.sh

Why: Next.js writes .next in place. A failed build leaves .next in a
broken state and pm2 serves client-side errors to users. The safe
script moves .next to .next.bak before the build; if the build fails
it rolls back, so the site stays up. pm2 restart runs only after the
build fully succeeds.

Enforcement:
- Every commit that touches apps/web must be verified by running
  the safe script and confirming "✅ deployed".
- If the script prints "❌ build FAILED" — do NOT commit, fix first.

## Rule — Check current branch before push

Before running `git push origin main`, ALWAYS verify you are ON main:

    git branch --show-current      # must print: main

If it prints anything else, either:
    git checkout main              # go back to main
  or
    git push origin <current>      # push to the correct branch

Lesson learned 2026-10-10: a commit intended for main was accidentally
made on a `ci-test` branch, then `git push origin main` reported
"Everything up-to-date" because local main had no new commits. Server
was silently serving stale code until discovered.

Add this check to every deploy:
    test "$(git branch --show-current)" = "main" || { echo "NOT ON MAIN"; exit 1; }
