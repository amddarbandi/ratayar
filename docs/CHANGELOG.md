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

## [0.95.6] — 2026-10-08

### 🔒 Milestone: All 5 Critical Security Bugs Resolved

این نسخه، **پنجمین و آخرین** باگ امنیتی سطح Critical را می‌بندد.
از این نقطه، پروژه در برابر ۵ آسیب‌پذیری اصلی امنیتی محافظت می‌شود.

### Fixed
- **SEC-005**: Invalidate tokens after password change
  - `jwt.strategy.ts`:
    - `RedisService` تزریق شد
    - در `validate()`، `pwd-changed:{userId}` چک می‌شود
    - مقایسه timestamp تغییر رمز با `payload.iat` (به milliseconds)
    - پیام دقیق: `'رمز عبور تغییر کرده است. لطفاً دوباره وارد شوید'`
  - `auth.service.ts` (`refreshToken`):
    - همان چک روی refresh token
    - حفظ پیام دقیق با `try/catch + instanceof UnauthorizedException`

### Verified
- `tsc --noEmit` = ۰ خطا
- `pnpm build` = موفق
- ۷ سناریو end-to-end:
  1. login → user + tokens ✅
  2. old access token → 200 (قبل تغییر رمز) ✅
  3. change password → success ✅
  4. old access token → **401** (باطل شد) ✅
  5. old refresh token → **401** (باطل شد) ✅
  6. login با رمز جدید → 200 ✅
  7. بازگرداندن رمز → success ✅

### Summary — تمام باگ‌های Critical
| ID | باگ | Tag | وضعیت |
|---|---|---|---|
| SEC-001 | OTP code exposure | v0.95.2 | ✅ |
| SEC-002 | Register OTP verify | v0.95.3 | ✅ |
| SEC-003 | 2FA enforcement on login | v0.95.5 | ✅ |
| SEC-004 | Backup codes TTL | v0.95.4 | ✅ |
| SEC-005 | Invalidate tokens after pwd change | v0.95.6 | ✅ |

### Known Issues (باقی‌مانده — غیر Critical)
- SEC-006: Token در localStorage (XSS-prone) — معماری، نیاز به تغییر بزرگ
- API-001 تا API-012: باگ‌های منطقی/عملکردی
- WEB-001 تا WEB-005: بهبودهای UI
- ARCH-001: `packages/*` خالی
- (لیست کامل در `docs/KNOWN-ISSUES.md`)

---

## [0.95.5] — 2026-10-08

### Fixed
- **SEC-003**: 2FA enforcement on login
  - Backend (`auth.service.ts`):
    - `import * as speakeasy from 'speakeasy'` اضافه شد
    - در `login()`، اگر `user.twoFaEnabled`:
      - بدون `twoFaCode` → `{requires2FA: true, phone}`
      - `twoFaSecret` نبود → 401 config error
      - TOTP verify با پنجره `±30s` (`window: 1`)
      - کد غلط → `recordFailedLogin` + 401
  - Backend (`login.dto.ts`): `@Length(6, 6)` روی `twoFaCode`
  - Frontend (`lib/api.ts`): type `login` شامل `twoFaCode?: string`
  - Frontend (`login/page.tsx`): دو مرحله‌ای شد
    - `step: 'credentials' | 'twoFa'`
    - مرحله ۱: phone + password → اگر `requires2FA` → مرحله ۲
    - مرحله ۲: کد ۶ رقمی TOTP
    - دکمه بازگشت به مرحله قبل

### Verified
- `tsc --noEmit` = ۰ خطا (api + web)
- `pnpm build` = موفق هر دو
- API tests: ۴ سناریو موفق
  1. user 2FA + بدون کد → `requires2FA: true`
  2. user 2FA + کد غلط → 401
  3. user 2FA + کد درست → user + tokens + `twoFaEnabled: true`
  4. user بدون 2FA → user + tokens (بدون `requires2FA`)
- Log: `WARN Failed login attempt 1` → `✅ User logged in`
- `pm2 restart` = موفق

### Known Issues (باقی‌مانده)
- SEC-005: Change password Redis key چک نمی‌شود
- (لیست کامل در `docs/KNOWN-ISSUES.md`)

---

## [0.95.4] — 2026-10-08

### Fixed
- **SEC-004**: Backup codes TTL
  - `settings.service.ts`: در `verify2FA`، TTL از `0` (بی‌نهایت) به `365 روز` تغییر کرد
  - `settings.service.ts`: در `regenerateBackupCodes`، همان تغییر
  - الگو: `365 * 24 * 60 * 60` (31,536,000 ثانیه)

### Verified
- `tsc --noEmit` = ۰ خطا
- `pnpm build` = موفق
- `pm2 restart zarvan-api` = موفق
- health = 200

### Known Issues (باقی‌مانده)
- SEC-003: 2FA در login چک نمی‌شود
- SEC-005: Change password check
- (لیست کامل در `docs/KNOWN-ISSUES.md`)

---

## [0.95.3] — 2026-10-08

### Fixed
- **SEC-002**: Register OTP verification
  - `register.dto.ts`: `otpCode` از `@IsOptional` به اجباری تغییر کرد
  - `auth.service.ts`: در `register()`, `verifyOtp()` قبل از `prisma.user.create` صدا زده می‌شود
  - `lib/api.ts`: type `authApi.register` به‌روز شد
  - `register/page.tsx`: `otpCode: otp` ارسال می‌شود
  - Redis: کد بعد از verify پاک می‌شود (یکبار مصرف)

### Verified
- `tsc --noEmit` = ۰ خطا
- `pnpm build` = موفق (web + api)
- API tests: 400 بدون کد / 400 کد غلط / 201 کد درست / 409 تکراری
- End-to-end: OTP sent → register → user + tokens
- Log: `📱 OTP sent for 0912***850` → `✅ User registered`

### Known Issues (باقی‌مانده)
- SEC-003: 2FA در login چک نمی‌شود
- SEC-004: Backup codes TTL=0
- SEC-005: Change password check
- (لیست کامل در `docs/KNOWN-ISSUES.md`)

---

## [0.95.2] — 2026-10-08

### Fixed
- **SEC-001**: OTP code exposure در production
  - `.env`: `DEV_OTP_ENABLED=false`
  - `auth.service.ts`: کد OTP فقط در `NODE_ENV=development` و `DEV_OTP_ENABLED=true` نمایش داده می‌شود
  - Defense in depth: دو لایه محافظت مستقل
  - لاگ حرفه‌ای: نمایش جزئی شماره (`0912***099`) به‌جای کد کامل

### Verified
- `tsc --noEmit` = ۰ خطا
- `pnpm build` = موفق
- API test: پاسخ `send-otp` بدون فیلد `code`
- Log format: `📱 OTP sent for 0912***099`

### Known Issues (باقی‌مانده)
- SEC-002: Register OTP verify نمی‌شود
- SEC-003: 2FA در login چک نمی‌شود
- SEC-004: Backup codes TTL=0
- SEC-005: Change password check
- (لیست کامل در `docs/KNOWN-ISSUES.md`)

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
