# Changelog

تمام تغییرات قابل توجه پروژه در این فایل ثبت می‌شود.

فرمت: [Keep a Changelog](https://keepachangelog.com/fa/1.1.0/)
نسخه‌گذاری: [Semantic Versioning](https://semver.org/lang/fa/)

---

## [Unreleased]

### در حال کار
- رفع باگ BUILD-001 (۲ خطای import در `documents/page.tsx`)

### برنامه‌ریزی‌شده
- رفع باگ‌های Critical (SEC-001 تا SEC-005)
- راه‌اندازی Git flow
- انتقال دامنه کامل به `ratayar.ir`
- حذف `zarvan.hitanetwork.com`

---

## [0.95] — 2026-10-07

### Added
- ۹ مدل Prisma (User, Family, FamilyMember, Obligation, Asset, Transaction, Budget, Notification, Document)
- ۷ migration
- ۱۲ ماژول API (auth, family, obligations, assets, finance, documents, notifications, settings, reports, search, terms, health)
- ۲۰ صفحه Web (landing, auth, join, dashboard، ۱۰ زیرصفحه)
- PWA دستی (sw.js + manifest + register-sw + install-prompt)
- JWT auth + 2FA (speakeasy) + bcrypt
- Family با invite code
- MinIO برای اسناد
- Redis برای lockout/OTP/blacklist
- Nginx config + SSL برای دو دامنه
- PM2 processes
- Cron jobs (health-check + backup)
- Docker services (Postgres + Redis + MinIO)
- Design system (Tailwind + custom utilities)
- Landing page کامل (hero, features, how-it-works, pricing, cta, navbar, footer)

### Changed
- دامنه اصلی از `zarvan.hitanetwork.com` به `ratayar.ir` در حال انتقال
- Brand name از «منشی» به «راتایار»

### Known Issues
- build وب شکسته (BUILD_ID موجود نیست)
- ۲ خطای import در `documents/page.tsx`
- `DEV_OTP_ENABLED=true` در production
- Register OTP verify نمی‌شود
- 2FA در login چک نمی‌شود
- (لیست کامل در `KNOWN-ISSUES.md`)

---

## [0.1] — 2026-10-05

### Added
- Initial commit
- Setup monorepo (Turborepo + pnpm)
- Next.js 14 app
- NestJS 10 app
- Docker compose
- Prisma init
- First migration (users, families, family_members)

---

## قالب برای نسخه‌های بعدی

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Added
- feature جدید

### Changed
- تغییر در feature موجود

### Deprecated
- چیزی که قرار است حذف شود

### Removed
- چیزی که حذف شد

### Fixed
- باگ رفع‌شده

### Security
- رفع آسیب‌پذیری
```

---

## لینک مرتبط

- [PROJECT-MEMORY.md](../PROJECT-MEMORY.md)
- [KNOWN-ISSUES.md](./KNOWN-ISSUES.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
