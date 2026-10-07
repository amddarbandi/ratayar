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

## [0.95.1] — 2026-10-08

### Fixed
- **BUILD-001**: رفع ۲ خطای import در `apps/web/src/app/dashboard/documents/page.tsx`
  - اضافه کردن `termsApi` به import از `@/lib/api`
  - اضافه کردن `import { TermsModal } from '@/components/terms/terms-modal'`
- Web دیگر در حلقه ری‌استارت نیست
- `BUILD_ID` به‌درستی تولید می‌شود
- PM2 پایدار (restarts ثابت پس از restart)

### Added
- راه‌اندازی Git repository + GitHub (Private)
- `.gitignore` + `.gitattributes` استاندارد
- `.env.example` به‌عنوان template
- مستندات کامل: `PROJECT-MEMORY.md`, `README.md`
- `docs/QUICKSTART.md`, `docs/ARCHITECTURE.md`, `docs/KNOWN-ISSUES.md`
- `backups/manual-*` از سورس + دیتابیس

### Verified
- `npx tsc --noEmit` = ۰ خطا
- `pnpm build` = موفق (۱۹ route)
- تست پایداری ۹۰ ثانیه‌ای موفق
- `curl https://ratayar.ir` = 200

### Known Issues (باقی‌مانده)
- `DEV_OTP_ENABLED=true` در production
- Register OTP verify نمی‌شود
- 2FA در login چک نمی‌شود
- لیست کامل در `docs/KNOWN-ISSUES.md`

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
