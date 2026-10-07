# Known Issues

لیست باگ‌ها و مشکلات شناخته‌شده، به‌ترتیب اولویت.

**آخرین به‌روزرسانی:** 2026-10-08

---

## 🔴 Critical — فوری

### BUILD-001: دو خطای import در `documents/page.tsx`
- **فایل:** `apps/web/src/app/dashboard/documents/page.tsx`
- **خطا:** `termsApi` و `TermsModal` استفاده شده ولی import نشده
- **تأثیر:** کل build وب شکست می‌خورد → ۲۶۸۰ بار restart → web از memory سرو می‌کند
- **راه‌حل:** اضافه کردن ۲ import
- **وضعیت:** 🔴 Open — **بالاترین اولویت**

### SEC-001: `DEV_OTP_ENABLED=true` در production
- **تأثیر:** کد OTP در پاسخ API برمی‌گردد → هر کسی می‌تواند وارد شود
- **راه‌حل:** `.env` → `DEV_OTP_ENABLED=false`
- **وضعیت:** 🔴 Open

### SEC-002: Register OTP verify نمی‌شود
- **فایل:** `apps/api/src/modules/auth/auth.service.ts`
- **مشکل:** `RegisterDto.otpCode` دریافت می‌شود ولی استفاده نمی‌شود
- **تأثیر:** هر کد ۶ رقمی (یا هیچ کد) قبول می‌شود
- **راه‌حل:** قبل از `prisma.user.create`, `verifyOtp` صدا زده شود
- **وضعیت:** 🔴 Open

### SEC-003: 2FA در login چک نمی‌شود
- **فایل:** `apps/api/src/modules/auth/auth.service.ts`
- **مشکل:** `LoginDto.twoFaCode` وجود دارد ولی در `login()` بررسی نمی‌شود
- **تأثیر:** کاربر با 2FA فعال می‌تواند بدون کد وارد شود
- **راه‌حل:** در `login()`, اگر `user.twoFaEnabled`, کد TOTP را verify کن
- **وضعیت:** 🔴 Open

### SEC-004: Backup codes هرگز expire نمی‌شوند
- **فایل:** `apps/api/src/modules/settings/settings.service.ts`
- **مشکل:** `redis.set('2fa-backup:${userId}', ..., 0)` — TTL=0 یعنی بدون انقضا
- **تأثیر:** کدهای پشتیبان برای همیشه معتبر می‌مانند
- **راه‌حل:** جایگزینی `0` با مقدار معقول (مثلاً یک سال)
- **وضعیت:** 🔴 Open

### SEC-005: Change password Redis key چک نمی‌شود
- **فایل:** `apps/api/src/modules/settings/settings.service.ts` + `auth/strategies/jwt.strategy.ts`
- **مشکل:** کلید `pwd-changed:${userId}` ست می‌شود ولی هیچ‌جا چک نمی‌شود
- **تأثیر:** tokenهای قدیمی بعد از تغییر رمز همچنان معتبر
- **راه‌حل:** در `jwt.validate`, چک کن `pwd-changed` key وجود دارد یا نه
- **وضعیت:** 🔴 Open

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

هیچ‌کدام تا الان.

---

## نحوه استفاده

- هر باگ جدید: ID منحصر به فرد (MODULE-NNN)
- بعد از رفع، به بخش «Resolved» منتقل شود با date
- اگر باگ دو بار رخ داد، باز Open شود با note
