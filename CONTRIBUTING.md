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
