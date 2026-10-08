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
