# Ratayar Roadmap

Master tracking file. Every task from the master backlog, with current status.

Status: [x] done | [~] in progress | [ ] todo | [-] skipped/deferred

Last updated: 2026-10-08

---

## Phase 1 — Business Critical (BIZ)

- [x] BIZ-001 Admin CRUD plans UI (done)
- [-] BIZ-002 ZarinPal integration (deferred — using card-to-card)
- [~] BIZ-003 Subscription lifecycle (backend + UI done; renewal/proration pending)
- [x] BIZ-004 Plan selection + upgrade flow (with receipt upload)
- [ ] BIZ-005 Invoice + PDF receipt
- [ ] BIZ-006 Plan limit enforcement (max oblig/assets/docs) — NEXT
- [ ] BIZ-007 Upload size limit per plan — NEXT
- [ ] BIZ-008 Storage top-up purchase
- [ ] BIZ-009 Rate limiting per plan
- [ ] BIZ-010 Proration on upgrade/downgrade

## Phase 2 — Persian Calendar (CAL)  [🔴 HIGH PRIORITY — user directive 2026-10-08]

> **User directive:** ALL dates in the entire panel must be Jalali (شمسی).
> No Gregorian display anywhere in UI. API still stores/computes in ISO.**


- [ ] CAL-001 Jalali DatePicker (react-multi-date-picker)
- [ ] CAL-002 Display all dates as Jalali
- [ ] CAL-003 Jalali input -> Gregorian in API
- [ ] CAL-004 Remaining days with Tehran timezone
- [ ] CAL-005 Year selection in asset form
- [ ] CAL-006 Event calendar (Jalali)
- [ ] CAL-007 Reports in Jalali months
- [ ] CAL-008 Dynamic today/tomorrow/yesterday

## Phase 3 — Files & Storage (FILES)

- [ ] FILES-001 Per-type format whitelist
- [ ] FILES-002 ClamAV virus scan
- [~] FILES-003 Storage usage graph in dashboard (backend ready via plan limits, UI pending)
- [ ] FILES-004 Storage breakdown by document type
- [ ] FILES-005 Usage warnings at 80% / 100%
- [ ] FILES-006 Pagination + lazy load
- [ ] FILES-007 Document versioning
- [ ] FILES-008 Share via expiring link
- [ ] FILES-009 Preview for docx/xlsx
- [ ] FILES-010 Persian OCR
- [ ] FILES-011 Bulk upload / drag-drop
- [ ] FILES-012 Archive old documents
- [x] API-003 documents.remove also deletes from MinIO (done)
- [x] API-002 documents.stream pipes from MinIO, no RAM buffer (done)

## Phase 4 — Security (SEC)

- [x] SEC-001 to SEC-005 (all resolved, see CHANGELOG 0.95.6)
- [x] SEC-016 PlansController admin guard (was missing RolesGuard)
- [ ] SEC-006 Token -> httpOnly cookie
- [ ] SEC-007 Email verification
- [ ] SEC-008 Forgot password flow
- [ ] SEC-009 Session management UI
- [ ] SEC-010 Login history
- [ ] SEC-011 Password strength + HIBP
- [ ] SEC-012 Account recovery
- [ ] SEC-013 Rate limiting per IP
- [ ] SEC-014 User audit log
- [ ] SEC-015 2FA backup codes UI
- [ ] PWA-001 SW API cache should include auth key

## Phase 5 — Family (FAM)

- [ ] FAM-001 Interactive family tree
- [ ] FAM-002 Family activity feed
- [ ] FAM-003 Permissions UI (RBAC)
- [ ] FAM-004 Invite by QR
- [ ] FAM-005 Family chat
- [ ] FAM-006 Multi-family support
- [ ] API-005 acceptInvite must verify phone

## Phase 6 — Business Features (BIZ-extra)

- [ ] BIZ-011 Customer cards UI
- [ ] BIZ-012 Automated customer follow-up
- [ ] BIZ-013 Team roles & permissions
- [ ] BIZ-014 Profit/loss report
- [ ] BIZ-015 Automated tax compliance
- [ ] BIZ-016 Integration with Iranian tax system (Samaneh Moadian)

## Phase 7 — Finance (FIN)

- [ ] FIN-001 Full Budget UI
- [ ] FIN-002 Goal-based saving
- [ ] FIN-003 Profit/loss report
- [ ] FIN-004 Bank API integration
- [ ] FIN-005 Category management
- [ ] FIN-006 Excel/PDF export

## Phase 8 — Live Market Prices (PRICE)

- [ ] PRICE-001 Gold price API proxy (tgju / bonbast)
- [ ] PRICE-002 Currency API proxy (USD/EUR/AED)
- [ ] PRICE-003 Crypto API proxy (CoinGecko)
- [ ] PRICE-004 Redis cache (60s refresh)
- [ ] PRICE-005 Dashboard widget: live price cards
- [ ] PRICE-006 Dedicated market page + historical chart
- [ ] PRICE-007 Price alerts (user-defined)
- [ ] PRICE-008 In-app currency converter
- [ ] PRICE-009 Sparkline 24h in widget
- [ ] PRICE-010 Fallback between sources

## Phase 9 — Clock & Calendar Day (CLOCK)  [🔴 HIGH PRIORITY]

> **User directive:** build a calendar page similar to time.ir — showing
> Jalali date, Gregorian date, Hijri date, day of week, daily events,
> holidays, prayer times, and family members' local times.


- [ ] CLOCK-001 "Today" menu in sidebar
- [ ] CLOCK-002 Analog SVG clock
- [ ] CLOCK-003 Square/round toggle
- [ ] CLOCK-004 Jalali + Gregorian + Hijri dates
- [ ] CLOCK-005 Daily events (holidays + occasions)
- [ ] CLOCK-006 Prayer times (Adhan)
- [ ] CLOCK-007 Family local times
- [ ] CLOCK-008 Multi-timezone
- [ ] CLOCK-009 Today's events at a glance
- [ ] CLOCK-010 Small clock widget in dashboard

## Phase 10 — Calculators & Tools (CALC)  [🔴 HIGH PRIORITY]

> **User directive:** two separate top-level menus:
>   1. "کانورت‌ها" — unit converters (weight/length/volume/temp/
>      currency/percent/date). **No file conversion.**
>   2. "Subnet Calculator" — IPv4 with full details + IPv6 support.


- [ ] CALC-001 "Calculators" menu in sidebar
- [ ] CALC-002 Scientific calculator
- [ ] CALC-003 Programmer calculator (hex/bin/oct)
- [ ] CALC-004 Weight converter
- [ ] CALC-005 Length converter
- [ ] CALC-006 Volume converter
- [ ] CALC-007 Temperature converter
- [ ] CALC-008 Currency converter (uses PRICE)
- [ ] CALC-009 Percentage/discount calculator
- [ ] CALC-010 Date math calculator
- [ ] CALC-011 Subnet Calculator (IPv4)
- [ ] CALC-012 Subnet Calculator (IPv6)
- [ ] CALC-013 VLSM Calculator
- [ ] CALC-014 CIDR converter
- [ ] CALC-015 IP range -> IP list
- [ ] CALC-016 Wildcard mask calculator
- [ ] CALC-017 MAC lookup + OUI
- [ ] CALC-018 Base64/URL/HTML encoder
- [ ] CALC-019 JSON formatter
- [ ] CALC-020 Hash calculator (MD5/SHA)
- [ ] CALC-021 UUID generator
- [ ] CALC-022 Unix timestamp converter
- [ ] CALC-023 QR code generator
- [ ] CALC-024 Password generator

### CALC — user directive additions

- [ ] CALC-MENU "تبدیل" top-level menu item (renamed from کانورت‌ها)
- [ ] CALC-MENU-2 "ماشین حساب شبکه" top-level menu item
- [ ] CALC-011-ADV IPv4 calculator with full detail (network, broadcast, usable range, mask, wildcard, class, type, CIDR list)
- [ ] CALC-012-ADV IPv6 calculator (prefix, expanded, compressed, range, number of addresses)

## Phase 11 — UX/UI

- [ ] UX-001 Onboarding tour
- [ ] UX-002 Help center
- [ ] UX-003 Feedback / bug report
- [ ] UX-004 Light mode
- [ ] UX-005 Accessibility (a11y)
- [ ] UX-006 Bulk operations
- [ ] UX-007 Dashboard customization
- [ ] UX-008 Search improvements
- [ ] UX-009 Notification preferences UI
- [ ] UX-010 Data export (GDPR)
- [ ] UX-011 Keyboard shortcuts
- [ ] UX-012 Toast standardization
- [ ] WEB-001 Assets year Jalali/Gregorian
- [ ] WEB-002 confirm() -> Modal
- [ ] WEB-003 Footer broken links
- [ ] WEB-004 Navbar #about
- [ ] WEB-005 Hero screenshot

## Phase 12 — Persona UIs

- [ ] UI-KID Kid interface (gamified)
- [ ] UI-TEEN Teen interface
- [ ] UI-ELDER Elder interface (voice-first)
- [ ] UI-ELDER-ADV Advanced elder (>85)
- [ ] UI-BIZ Business dashboard

## Phase 13 — Infrastructure (INF)

- [ ] INF-001 GitHub Actions CI
- [ ] INF-002 Sentry / error tracking
- [ ] INF-003 Prometheus + Grafana
- [ ] INF-004 Structured logging
- [ ] INF-005 Uptime monitoring
- [ ] INF-006 Backup to external S3/MinIO
- [ ] INF-007 Remove zarvan.hitanetwork.com
- [ ] INF-008 Nginx tune
- [x] INF-009 Prisma seed (plans seed done)
- [ ] INF-010 Rotate secrets
- [ ] INF-011 Docker image for API+Web
- [ ] INF-012 Kubernetes (future)

## Phase 14 — API Bugs

- [x] API-001 UUID validation in documents.findOne — DONE
- [ ] API-004 Real SMS notifications (Kavenegar)
- [ ] API-006 obligation.assetId persistence
- [ ] API-007 obligation.remove soft delete
- [ ] API-008 Repeat obligations
- [ ] API-009 Dynamic invite link
- [ ] API-010 Health check for DB/Redis/MinIO
- [ ] API-011 settings.getSessions real implementation
- [ ] API-012 Uniform date timezone

## Phase 15 — Architecture (ARCH)

- [ ] ARCH-001 Fill packages/ or delete
- [ ] ARCH-002 Delete empty packages
- [ ] ARCH-003 Shared types web/api
- [ ] ARCH-004 middleware.ts auth guard
- [ ] ARCH-005 WebSocket notifications
- [ ] ARCH-006 i18n infrastructure

## Phase 16 — Testing

- [ ] TEST-001 Unit tests auth service
- [ ] TEST-002 Integration tests
- [ ] TEST-003 E2E (Playwright)
- [ ] TEST-004 Load testing (k6)
- [ ] TEST-005 Coverage > 70%

## Phase 17 — Documentation

- [ ] DOC-001 Update PROJECT-MEMORY sections 13-14
- [ ] DOC-002 Full Swagger
- [ ] DOC-003 Developer guide
- [ ] DOC-004 User manual

## Phase 18 — Internationalization (INT)

- [ ] INT-001 Multi-currency
- [ ] INT-002 Multi-timezone
- [ ] INT-003 Arabic / English UI
- [ ] INT-004 Country defaults

---

## Completed on branch feat/plans-subscriptions

- [x] BUILD-002: PM2 crash loop fix (rootDir in tsconfig)
- [x] API-001: UUID validation in DocumentsController
- [x] Auth: RolesGuard + @Roles decorator + role in JWT
- [x] Backend module: subscriptions (4 routes)
- [x] Backend module: payments (5 routes, auto-ticket)
- [x] Backend module: tickets (7 routes)
- [x] Prisma: Plan / Subscription / PaymentRequest / Ticket / TicketMessage models
- [x] Migration: 20261008083117_add_plans_subscriptions_payments_tickets
- [x] Seed: 4 plans (free / personal / family / business)

## Next up (in order) — updated 2026-10-08

### Current focus (per user directive, updated 2026-10-09)

Order of work:

1. **B — Converters (کانورت‌ها)** — HIGH — IN PROGRESS
   Very graphical, colorful, appealing from a 7-year-old to an
   80-year-old. Unit conversions only (NO file conversion).
   Categories: weight, length, volume, temperature, area, time,
   data size, speed, pressure, energy, currency.
   Design: big category cards with emojis, live conversion as you
   type, swap button, copy result, quick reference table.

2. **C — Subnet Calculator** — HIGH — NEXT
   Engineering / network theme (router, switch, cables, racks).
   IPv4 with full detail (network, broadcast, mask, wildcard, host
   range, CIDR list, class, type) + IPv6 (compressed / expanded,
   prefix, range, total addresses).

3. **A — Clock / time.ir-like page** — HIGH — AFTER C
   Analog SVG clock (square + round), Jalali + Gregorian + Hijri,
   daily events, holidays, prayer times (adhan), family local times.

Everything must be recorded in GitHub (roadmap, module docs, commit
messages, changelog).

### Also HIGH (new — user directive 2026-10-09)

4. **بازار و قیمت‌ها (Market & Prices) — PRICE-001..010**
   Separate top-level menu, distinct from converters.
   Categories: طلا و سکه, ارز, ارز دیجیتال
   Includes a live cross-category converter.
   Architecture: docs/modules/market-prices.md

### Afterwards (previous plan)

4. INF-001 — GitHub Actions CI
5. API-004 — Kavenegar SMS
6. BIZ-005 — Invoice PDF
7. BIZ-003 — Renewal / cancel / downgrade UI
