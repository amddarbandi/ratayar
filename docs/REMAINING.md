# Remaining Roadmap — full list

Last updated: 2026-10-11
Status: auto-generated from session logs. Items are ordered by group,
not by priority. See "Execution order" at the end for the frozen order.

---

## ✅ Done this session

| # | ID | Title | Commit |
|---|---|---|---|
| 1 | BUILD-002 | PM2 crash loop fix (rootDir) | 94e1b4b |
| 2 | API-001 | UUID validation in documents | 7afb849 |
| 3 | SEC-016 | RolesGuard on PlansController | eced2ba |
| 4 | Modules | plans, subscriptions, payments, tickets, plan-limits | various |
| 5 | Admin Panel | 21 pages (users/subs/revenue/plans/payments/tickets/ documents/obligations/notifications/audit-log/settings/ flags/backup/broadcast/analytics/abuse/api-keys) | various |
| 6 | AuditLog | AuditInterceptor + @Audited | cb2d36d |
| 7 | Frontend user | pricing, upgrade, storage, tickets | various |
| 8 | Converters | 10 categories, 74 units | 1022e34 |
| 9 | Market | TGJU + Wallex + CoinGecko + sparkline | 56154be, 5740b45 |
| 10 | IP/Subnet | IPv4 + IPv6 full detail | ae7f295 |
| 11 | Calendar | redesign with monthly grid | a194173 |
| 12 | Theme | Cyberpunk Emerald (tailwind remap) | 5b2d4a9 |
| 13 | Persian numbers | lib/format.ts central | ebc7ef4, d37d97d, 204da58, 7d7d121 |
| 14 | MOB-001..016 | Bottom nav, tap targets, typography | various |
| 15 | B1/B2/B3 | copy/calendar/numbers | various |
| 16 | L2 | Email verification (full stack) | d8cfe5d, ed1cd0b, 2a4b226, 663df1f |
| 17 | L1 | Profile completion modal + national ID validation | 02a1ef9, fccbcff |
| 18 | PAY order | Execution order recorded | 578112e |

---

## 🟠 Remaining — by group

### Group 1 — Immediate (this week)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 1 | A-3 | Bulk message per user | "Send direct message" button on /admin/users/[id], reuses Broadcast backend | 30m |
| 2 | CI fix | GitHub Actions red | Check log, fix pnpm setup step | 30m |
| 3 | BIZ-005 | Invoice PDF | PDF receipt with tracking number + QR | 2h |
| 4 | B extras | localStorage/share/percent/date calc | Persist last converter choice, share result, % and date calculators | 1h |
| 5 | CALC extras | Remaining calculators | CALC-013..024: VLSM, MAC lookup, Base64, JSON, Hash, UUID, QR, Password | 4h |

### Group 2 — Security (SEC)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 6 | SEC-006 | Token -> httpOnly cookie | Move access/refresh from localStorage | 1h |
| 7 | SEC-007 | Email verification hardening | Shorter TTL, rate-limit send-code | 30m |
| 8 | SEC-008 | Forgot password flow | Email/SMS-based recovery | 2h |
| 9 | SEC-009 | Session management UI | List active sessions + kill | 2h |
| 10 | SEC-010 | Login history | Per-user history | 1h |
| 11 | SEC-011 | Password strength + HIBP | Strength meter + breach check | 2h |
| 12 | SEC-012 | Account recovery | Recovery for locked accounts | 3h |
| 13 | SEC-013 | Rate limiting per IP | Request throttling | 1h |
| 14 | SEC-014 | User audit log | Log user actions (not just admin) | 3h |
| 15 | SEC-015 | 2FA backup codes UI | Backup codes management page | 30m |

### Group 3 — Iran-ready (CAL completion)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 16 | CAL-002 | All dates Jalali — audit | Final audit for any remaining Gregorian | 1h |
| 17 | CAL-005 | Jalali year in asset form | Vehicle/property year picker | 30m |
| 18 | CAL-006 | Event calendar | Full calendar page with per-day events | 2h |
| 19 | CAL-007 | Reports with Jalali months | Chart axes in Jalali | 1h |
| 20 | CAL-008 | Dynamic today/tomorrow/yesterday | Replace literals with relativeJalali | 30m |

### Group 4 — Family + Finance

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 21 | FAM-001 | Interactive family tree | Visual graph | 4h |
| 22 | FAM-002 | Family activity feed | Per-member actions | 2h |
| 23 | FAM-003 | Permissions UI (RBAC) | Roles + access | 3h |
| 24 | FAM-004 | Invite by QR | QR for family invite | 30m |
| 25 | FAM-005 | Family chat | In-family messaging | 4h |
| 26 | API-005 | acceptInvite checks phone | Security fix | 10m |
| 27 | FIN-001 | Full Budget UI | Monthly budget | 3h |
| 28 | FIN-002 | Goal-based saving | Savings goals | 3h |
| 29 | FIN-006 | Excel/PDF export | Financial report export | 2h |

### Group 5 — Live Prices (PRICE completion)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 30 | PRICE-006 | Market page + historical chart | Dedicated page with history | 4h |
| 31 | PRICE-007 | Price alerts | User-defined, SMS notify | 3h |
| 32 | PRICE-010 | Source fallback | Reliability across providers | 2h |

### Group 6 — Infrastructure (INF)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 33 | INF-002 | Sentry / error tracking | Error monitoring | 1h |
| 34 | INF-003 | Prometheus + Grafana | Metrics + dashboards | 4h |
| 35 | INF-004 | Structured logging | JSON logs | 3h |
| 36 | INF-005 | Uptime monitoring | Availability checks | 30m |
| 37 | INF-006 | Backup to external S3/MinIO | Daily automated | 2h |
| 38 | INF-007 | Remove zarvan.hitanetwork.com | DNS cleanup | 30m |
| 39 | INF-008 | Nginx tune | Performance | 30m |
| 40 | INF-010 | Rotate secrets | Key rotation | 30m |
| 41 | INF-011 | Docker image for API+Web | Dockerfile | 4h |

### Group 7 — Testing (TEST)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 42 | TEST-001 | Unit tests auth | Auth service tests | 4h |
| 43 | TEST-002 | Integration tests | API integration | 4-6h |
| 44 | TEST-003 | E2E (Playwright) | End-to-end | 4-8h |
| 45 | TEST-004 | Load testing (k6) | Load tests | 4h |
| 46 | TEST-005 | Coverage > 70% | Coverage target | ongoing |

### Group 8 — UX/UI

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 47 | UX-001 | Onboarding tour | Tutorial | 4h |
| 48 | UX-002 | Help center | Help docs | 3h |
| 49 | UX-004 | Light mode | Light theme | 2h |
| 50 | UX-005 | Accessibility (a11y) | A11y audit | 4h |
| 51 | UX-007 | Dashboard customization | Widget ordering | 4h |
| 52 | UX-010 | Data export (GDPR) | User data export | 3h |
| 53 | WEB-002 | confirm() -> Modal | Replace native confirms | 30m |
| 54 | WEB-003 | Footer broken links | Fix links | 20m |

### Group 9 — Business extras (BIZ)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 55 | BIZ-008 | Storage top-up | Buy extra space | 2h |
| 56 | BIZ-009 | Rate limiting per plan | Plan-based throttle | 2h |
| 57 | BIZ-010 | Proration on upgrade/downgrade | Precise proration | 3h |
| 58 | BIZ-011 | Customer cards UI | Customer cards | 4h |
| 59 | BIZ-013 | Team roles & permissions | Team RBAC | 3h |
| 60 | BIZ-014 | Profit/loss report | P/L | 3h |
| 61 | BIZ-015 | Tax compliance | Auto tax | 4h |
| 62 | BIZ-016 | Samaneh Moadian integration | Iranian tax system | 6h |

### Group 10 — Architecture (ARCH)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 63 | ARCH-001 | Fill packages/ | Shared types | 1.5h |
| 64 | ARCH-003 | Shared types web/api | Avoid drift | 4h |
| 65 | ARCH-004 | middleware.ts auth guard | Next.js guard | 2h |
| 66 | ARCH-005 | WebSocket notifications | Real-time | 4h |
| 67 | ARCH-006 | i18n infra | Multilingual | 1 day |

### Group 11 — Documentation (DOC)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 68 | DOC-001 | Update PROJECT-MEMORY | Refresh sections 13-14 | 30m |
| 69 | DOC-002 | Full Swagger | API docs | 2h |
| 70 | DOC-003 | Developer guide | Dev docs | 2h |
| 71 | DOC-004 | User manual | User-facing | 1 day |

### Group 12 — Internationalization (INT)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 72 | INT-001 | Multi-currency | Multi-currency support | 4h |
| 73 | INT-002 | Multi-timezone | TZ support | 3h |
| 74 | INT-003 | Arabic / English UI | i18n | 3 days |
| 75 | INT-004 | Country defaults | Defaults per country | 1 week |

### Group 13 — Persona UIs

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 76 | UI-KID | Kid interface (gamified) | Ages 7-12 | 2 days |
| 77 | UI-TEEN | Teen interface (competitive) | Ages 13-19 | 2 days |
| 78 | UI-ELDER | Elder interface (voice-first) | Ages 60+ | 2 days |
| 79 | UI-ELDER-ADV | Advanced elder | Ages 85+ | 2 days |
| 80 | UI-BIZ | Business dashboard | Business users | 1 day |

### Group 14 — Final (frozen order per user)

| # | ID | Title | Notes | Est. |
|---|---|---|---|---|
| 99 | API-004 | Kavenegar SMS | Real SMS delivery | 90m |
| 100 | PAY-001 | Online payment gateway | ZarinPal or other, replaces BIZ-002 | 5-8h |

---

## 🎯 Execution order (frozen 2026-10-11)

1. A-3  — bulk message per user
2. CI fix — GitHub Actions
3. BIZ-005 — invoice PDF
4. B extras — localStorage / share / percent / date
5. CALC extras — remaining calculators
6. SEC-006..015 — security hardening
7. CAL-002..008 — Jalali completion
8. FAM / FIN / PRICE — feature depth
9. INF / TEST / UX / ARCH / DOC / INT — supporting
10. UI-KID / TEEN / ELDER / BIZ — persona UIs
11. **API-004 — Kavenegar SMS** (near end)
12. **PAY-001 — online payment gateway** (LAST)

---

## Suggested next actions (pick one)

- **A)** A-3 (in order)
- **B)** CI fix (since it's currently red)
- **C)** BIZ-005 (invoice PDF)
- **D)** SEC-006 (security)

