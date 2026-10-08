# Known Issues

لیست باگ‌ها و مشکلات شناخته‌شده، به‌ترتیب اولویت.

**آخرین به‌روزرسانی:** 2026-10-08
**وضعیت امنیتی:** 🎉 همه ۵ باگ Critical رفع شد (SEC-001 تا SEC-005)

---

## 🔴 Critical — فوری

---

## 🟠 High — مهم

### API-001: UUID validation در `documents.findOne`
- **فایل:** `apps/api/src/modules/documents/documents.service.ts:94`
- **مشکل:** `id` بدون validation به Prisma داده می‌شود
- **تأثیر:** `PrismaClientKnownRequestError: UUID invalid` → 500 response
- **راه‌حل:** `@Param('id', new ParseUUIDPipe())` در controller یا `validate` در service
- **وضعیت:** 🟠 Open (یک بار در 22:48 رخ داد)

### API-002: `documents.stream` کل فایل در RAM
- **فایل:** `apps/api/src/modules/documents/documents.service.ts`
- **مشکل:** `getFile` تمام buffer را لود می‌کند سپس `res.end(buffer)`
- **تأثیر:** ۵۰MB × N کاربر همزمان = DoS
- **راه‌حل:** pipe مستقیم MinIO stream به `res`
- **وضعیت:** 🟠 Open

### API-003: `documents.remove` از MinIO پاک نمی‌کند
- **فایل:** `apps/api/src/modules/documents/documents.service.ts`
- **مشکل:** فقط soft delete در DB
- **تأثیر:** MinIO پر از فایل یتیم
- **راه‌حل:** صدا زدن `minio.removeFile(storageKey)` قبل از soft delete
- **وضعیت:** 🟠 Open

### API-004: Notifications واقعاً ارسال نمی‌شوند
- **فایل:** `apps/api/src/modules/notifications/notifications.service.ts`
- **مشکل:** `processScheduledNotifications` فقط status را `sent` می‌کند
- **تأثیر:** سیستم اعلان عملاً بی‌کار است
- **راه‌حل:** یکپارچه‌سازی Kavenegar SMS
- **وضعیت:** 🟠 Open

### PWA-001: SW API cache بدون auth key
- **فایل:** `apps/web/public/sw.js`
- **مشکل:** `CACHE_API` پاسخ‌های `/api/` را cache می‌کند بدون تفکیک کاربر
- **تأثیر:** کاربر A logout → کاربر B login → داده‌های A نمایش داده می‌شود
- **راه‌حل:** cache key شامل auth token یا حذف cache API
- **وضعیت:** 🟠 Open

### SEC-006: Token در localStorage
- **فایل:** `apps/web/src/lib/api.ts`, `stores/auth-store.ts`
- **مشکل:** accessToken و refreshToken در localStorage
- **تأثیر:** XSS → دزدیدن token
- **راه‌حل:** انتقال به httpOnly cookie
- **وضعیت:** 🟠 Open

### API-005: `acceptInvite` چک شماره نمی‌کند
- **فایل:** `apps/api/src/modules/family/family.service.ts`
- **مشکل:** هر کسی با هر کد می‌تواند عضو شود، حتی اگر کد برای شماره دیگری باشد
- **تأثیر:** جعل عضویت
- **راه‌حل:** چک کن `invite.phone === currentUser.phone` یا `invite` را بدون phone بساز
- **وضعیت:** 🟠 Open

### API-006: `obligation.assetId` ذخیره نمی‌شود
- **فایل:** `apps/api/src/modules/obligations/obligations.service.ts`
- **مشکل:** در `create()`, `assetId` از DTO خوانده می‌شود ولی در `data` نیست
- **تأثیر:** تعهد به دارایی لینک نمی‌شود
- **راه‌حل:** `assetId: dto.assetId || null` در `data`
- **وضعیت:** 🟠 Open

### API-007: `obligation.remove` hard delete
- **فایل:** `apps/api/src/modules/obligations/obligations.service.ts`
- **مشکل:** `prisma.obligation.delete` واقعی
- **تأثیر:** تاریخچه از دست می‌رود، inconsistent با بقیه مدل‌ها
- **راه‌حل:** soft delete با `deletedAt` (نیاز به migration)
- **وضعیت:** 🟠 Open

### API-008: Repeat obligations کار نمی‌کند
- **فایل:** `apps/api/src/modules/obligations/obligations.service.ts`
- **مشکل:** `complete()` فقط `status=completed` می‌کند، تعهد بعدی را نمی‌سازد
- **تأثیر:** تعهدات تکرارشونده (ماهانه، سالانه) از بین می‌روند
- **راه‌حل:** در `complete()`, اگر `repeatType !== 'once'`, یک نسخه جدید بساز
- **وضعیت:** 🟠 Open

---

## 🟡 Medium — نیمه‌مهم

### API-009: `inviteLink` هاردکد به دامنه قدیمی
- **فایل:** `apps/api/src/modules/family/family.service.ts`
- **مشکل:** `https://zarvan.hitanetwork.com/join/${code}`
- **راه‌حل:** استفاده از `WEB_URL` از env

### WEB-001: assets year شمسی/میلادی
- **فایل:** `apps/web/src/app/dashboard/assets/new/page.tsx`
- **مشکل:** placeholder `۱۴۰۰` (شمسی)، ولی DTO `Min(1300) Max(1500)`
- **راه‌حل:** تبدیل شمسی ↔ میلادی در frontend یا backend

### API-010: `health` endpoint فقط uptime
- **فایل:** `apps/api/src/modules/health/health.controller.ts`
- **مشکل:** DB/Redis/MinIO چک نمی‌شوند
- **راه‌حل:** اضافه کردن `@nestjs/terminus` health checks

### API-011: `settings.getSessions` fake
- **فایل:** `apps/api/src/modules/settings/settings.service.ts`
- **مشکل:** یک آرایه ثابت برمی‌گرداند
- **راه‌حل:** track واقعی session‌ها در Redis

### WEB-002: `confirm()` بومی همه‌جا
- **فایل‌ها:** `obligations`, `assets`, `documents`, `finance`
- **مشکل:** UX ضعیف، استایل ناهماهنگ
- **راه‌حل:** Modal custom

### WEB-003: Footer لینک‌های broken
- **فایل:** `apps/web/src/components/layout/footer.tsx`
- **مشکل:** لینک به `/about`, `/contact`, `/blog`, `/privacy`, `/terms` که وجود ندارند
- **راه‌حل:** ساخت صفحات یا حذف لینک‌ها

### WEB-004: Navbar لینک به `#about` بدون section
- **فایل:** `apps/web/src/components/layout/navbar.tsx`
- **مشکل:** scroll به section ناموجود
- **راه‌حل:** ساخت section یا حذف

### WEB-005: Hero placeholder بدون screenshot
- **فایل:** `apps/web/src/components/landing/hero.tsx`
- **مشکل:** «داشبورد زیبای راتایار» placeholder text
- **راه‌حل:** screenshot واقعی یا mockup

### ARCH-001: `packages/*` همه خالی
- **مسیرها:** `packages/shared/`, `packages/ui/`, `packages/tsconfig/`
- **مشکل:** workspace تعریف شده ولی محتوا ندارد
- **راه‌حل:** انتقال types مشترک و UI مشترک یا حذف پوشه‌ها

### API-012: Date timezone در SSR
- **فایل‌ها:** متعدد
- **مشکل:** `new Date(x).toLocaleDateString('fa-IR')` در SSR → timezone سرور (UTC)
- **راه‌حل:** استفاده از `date-fns-jalali` به‌طور یکسان یا پاس دادن timezone

---

## ✅ Resolved

### SEC-005: Invalidate tokens after password change — ✅ 2026-10-08
- **رفع با:** branch `fix/sec-005-pwd-changed` (merged به main)
- **Merge commit:** `2431bf2`
- **Tag:** `v0.95.6`
- **فایل‌های تغییر یافته:**
  - `apps/api/src/modules/auth/strategies/jwt.strategy.ts` (+20)
  - `apps/api/src/modules/auth/auth.service.ts` (+20/-1)
- **جزئیات:**
  - `jwt.strategy.validate`: `pwd-changed:{userId}` چک می‌شود
  - مقایسه `pwdChangedAtMs > tokenIssuedAtMs`
  - `refreshToken`: همان چک روی `payload.sub`
  - پیام دقیق: `'رمز عبور تغییر کرده است. لطفاً دوباره وارد شوید'`
- **Verification:**
  - ۷ سناریو end-to-end موفق
  - old access/refresh → 401 بعد از تغییر رمز
  - login با رمز جدید → 200

### SEC-003: 2FA enforcement on login — ✅ 2026-10-08
- **رفع با:** branch `fix/sec-003-login-2fa` (merged به main)
- **Merge commit:** `0ad7199`
- **Tag:** `v0.95.5`
- **فایل‌های تغییر یافته:**
  - `apps/api/src/modules/auth/auth.service.ts` (+36)
  - `apps/api/src/modules/auth/dto/login.dto.ts` (+5/-5)
  - `apps/web/src/lib/api.ts` (+1/-1)
  - `apps/web/src/app/(auth)/login/page.tsx` (+180/-53)
- **جزئیات:**
  - Backend: TOTP verify با speakeasy (`window: 1` = ±30s)
  - Backend: بازگرداندن `{requires2FA: true, phone}` در مرحله اول
  - Frontend: login دو مرحله‌ای (`credentials` → `twoFa`)
  - Defense: کد غلط → `recordFailedLogin` (lockout هم‌چنان فعال)
- **Verification:**
  - tsc = ۰ خطا (api + web)
  - pnpm build = موفق
  - API tests: ۴ سناریو موفق
  - End-to-end از فرانت: (تست مرورگر در فاز بعد)

### SEC-004: Backup codes TTL — ✅ 2026-10-08
- **رفع با:** branch `fix/sec-004-backup-ttl` (merged به main)
- **Merge commit:** `522f573`
- **Tag:** `v0.95.4`
- **فایل تغییر یافته:** `apps/api/src/modules/settings/settings.service.ts` (+5/-2)
- **جزئیات:**
  - در `verify2FA`: `redis.set(..., 0)` → `redis.set(..., 365 * 24 * 60 * 60)`
  - در `regenerateBackupCodes`: همان تغییر
  - کدهای پشتیبان حالا بعد از ۱ سال expire می‌شوند
- **Verification:**
  - `tsc --noEmit` = ۰ خطا
  - `pnpm build` = موفق

### SEC-002: Register OTP verification — ✅ 2026-10-08
- **رفع با:** branch `fix/sec-002-register-otp` (merged به main)
- **Merge commit:** `8f088b8`
- **Tag:** `v0.95.3`
- **فایل‌های تغییر یافته:**
  - `apps/api/src/modules/auth/dto/register.dto.ts` (+16/-5)
  - `apps/api/src/modules/auth/auth.service.ts` (+10/-0)
  - `apps/web/src/lib/api.ts` (+1/-1)
  - `apps/web/src/app/(auth)/register/page.tsx` (+1/-0)
- **جزئیات:**
  - `otpCode` در RegisterDto از `@IsOptional` به `@IsNotEmpty + @IsString + @Length(6,6)` تغییر کرد
  - در `register()`, `verifyOtp(phone, otpCode)` قبل از `prisma.user.create`
  - `verifyOtp` کد را از Redis پاک می‌کند (یکبار مصرف)
  - Frontend `otpCode` را از state `otp` می‌فرستد
- **Verification:**
  - API tests: 400 بدون کد / 400 کد غلط / 201 کد درست / 409 تکراری
  - End-to-end از فرانت: موفق
  - `tsc --noEmit` = ۰ خطا
  - `pnpm build` = موفق

### SEC-001: OTP code exposure در production — ✅ 2026-10-08
- **رفع با:** branch `fix/sec-001-otp` (merged به main)
- **Merge commit:** `ccf57d9`
- **Tag:** `v0.95.2`
- **فایل‌های تغییر یافته:** `apps/api/src/modules/auth/auth.service.ts` (+12/-3), `.env`
- **جزئیات:**
  - `.env`: `DEV_OTP_ENABLED=true` → `false`
  - `auth.service.ts`: شرط `NODE_ENV === 'development' && DEV_OTP_ENABLED` برای نمایش کد
  - Defense in depth: حتی اگر `.env` اشتباهاً تغییر کند، در production کد نمایش داده نمی‌شود
  - لاگ امن: `📱 OTP sent for 0912***099` (بدون کد کامل)
- **Verification:**
  - `tsc --noEmit` = ۰ خطا
  - `pnpm build` = موفق
  - API test: پاسخ بدون فیلد `code`

### BUILD-001: دو خطای import در `documents/page.tsx` — ✅ 2026-10-08
- **رفع با:** branch `fix/build-v0.95` (merged به main)
- **Merge commit:** `559c858`
- **Tag:** `v0.95.1`
- **فایل تغییر یافته:** `apps/web/src/app/dashboard/documents/page.tsx` (+2/-1)
- **جزئیات:** دو import (`termsApi` از `@/lib/api` و `TermsModal` از `@/components/terms/terms-modal`) اضافه شد
- **Verification:**
  - `npx tsc --noEmit` = ۰ خطا
  - `pnpm build` = موفق (۱۹ route)
  - تست پایداری ۹۰ ثانیه‌ای موفق
  - `curl https://ratayar.ir` = 200

---

### BUILD-002: PM2 crash loop — `MODULE_NOT_FOUND` برای `dist/main.js` — ✅ 2026-10-08
- **رفع با:** commit `94e1b4b` روی branch `feat/plans-subscriptions`
- **فایل تغییر یافته:** `apps/api/tsconfig.json` (+3/-3)
- **ریشه مشکل:**
  - `include` شامل هم `src/**/*` و هم `prisma/**/*` بود
  - TypeScript نمی‌توانست `rootDir` را تشخیص دهد → آن را روی ریشه پروژه تنظیم می‌کرد
  - خروجی در `dist/src/main.js` و `dist/prisma/**` ساخته می‌شد
  - PM2 به `apps/api/dist/main.js` اشاره می‌کرد → `MODULE_NOT_FOUND` → ۱۹۴ بار restart
- **راه‌حل:**
  - افزودن صریح `"rootDir": "./src"`
  - محدود کردن `include` به `["src/**/*"]`
  - انتقال `prisma` به `exclude` (schema توسط nest build کامپایل نمی‌شود)
- **Verification:**
  - `ls dist/main.js` = ✅ (3054 bytes)
  - `ls dist/modules/plans/` = ✅
  - `pm2 logs` = `🚀 Ratayar API running on port 4000`
  - ۷ روت Plans در startup map شدند
  - Prisma/Redis/MinIO = ✅ همه connect

## نحوه استفاده

- هر باگ جدید: ID منحصر به فرد (MODULE-NNN)
- بعد از رفع، به بخش «Resolved» منتقل شود با date
- اگر باگ دو بار رخ داد، باز Open شود با note
