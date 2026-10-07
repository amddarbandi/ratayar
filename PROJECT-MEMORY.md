# 🧠 PROJECT-MEMORY — راتایار (Ratayar)

> **نسخه سند:** 1.0
> **آخرین به‌روزرسانی:** 2026-10-08
> **هدف:** مرجع کامل برای هر AI یا توسعه‌دهنده جدید.
> **قاعده طلایی:** این سند را قبل از هر تغییر بخوان. اگر با کد مغایرت داشت، کد را مبنا بگیر و این سند را آپدیت کن.

---

> **🔄 به‌روزرسانی (2026-10-08):** بخش‌های ۱۳ و ۱۴ این سند قدیمی هستند.
> وضعیت دقیق در `docs/KNOWN-ISSUES.md` و `docs/CHANGELOG.md`.
> **خلاصه:** BUILD-001 حل شد (v0.95.1). ۵ باگ امنیتی باقی است.



## ۱. پروژه چیست؟

**راتایار (Ratayar)** — یک وب‌اپلیکیشن PWA دستیار شخصی/خانوادگی/کسب‌وکار.

**پیام:** «دستیار هوشمند زندگی از ۷ سال تا ۱۰۰ سال»

**مسئله:** مردم ده‌ها تعهد کوچک و بزرگ دارند (بیمه، معاینه فنی، دارو، مالیات، اجاره، مدرسه، دکتر پدربزرگ). فراموشی = جریمه، دیرکرد، خطر جانی. ابزارهای موجود جزیره‌ای، منفعل، شخصی و سن‌محورند.

**راه‌حل:** یک منشی فعال که تعهدات را از دارایی‌ها استخراج می‌کند، از قبل هشدار می‌دهد، تصمیم پیشنهاد می‌دهد، سند نگه می‌دارد، هزینه می‌شمارد، و کل خانواده را به هم وصل می‌کند.

---

## ۲. اطلاعات حیاتی زیرساخت

### سرور
- **مسیر پروژه:** `/var/www/zarvan`
- **مدیر پروسه:** PM2 (user: root)
- **Node.js:** 20.20.2
- **Package manager:** pnpm 9.0.0 (workspace + turbo)

### دامنه
- **اصلی:** `ratayar.ir` و `www.ratayar.ir` (SSL: `ratayar.ir-0001`)
- **legacy (در حال حذف):** `zarvan.hitanetwork.com`

### PM2
| نام | Script | cwd | Port |
|---|---|---|---|
| `zarvan-web` | `node_modules/.bin/next start -p 3000` | `/var/www/zarvan/apps/web` | 3000 |
| `zarvan-api` | `apps/api/dist/main.js` | `/var/www/zarvan/apps/api` | 4000 |

### Docker
| Service | Image | Port |
|---|---|---|
| `zarvan-postgres` | postgres:16-alpine | 127.0.0.1:5432 |
| `zarvan-redis` | redis:7-alpine | 127.0.0.1:6379 |
| `zarvan-minio` | minio/minio:latest | 127.0.0.1:9000,9001 |

### Nginx
- Config: `/etc/nginx/sites-enabled/zarvan` → symlink به `/etc/nginx/sites-available/zarvan`
- Upstreams: `zarvan_api` (4000)، `zarvan_web` (3000)، `zarvan_minio` (9000)
- Routes: `/api/` → API، `/documents/` → MinIO، `/_next/static/` → cache 1y، `/sw.js` → no-cache، `/health` → API، `/` → Next.js

### Cron
```
*/2 * * * * /var/www/zarvan/scripts/health-check.sh >> /var/www/zarvan/logs/health.log 2>&1
0 3 * * * /var/www/zarvan/scripts/backup.sh >> /var/www/zarvan/logs/backup.log 2>&1
```

### Environment
- تنها فایل: `/var/www/zarvan/.env` (مشترک بین web و api)
- Symlink: `apps/api/.env → /var/www/zarvan/.env`
- web هیچ `.env.local` جداگانه ندارد، از `/api` relative استفاده می‌کند

---

## ۳. ساختار Monorepo

```
/var/www/zarvan/
├── apps/
│   ├── web/              ← Next.js 14 (App Router) + PWA
│   └── api/              ← NestJS 10 + Prisma 5
├── packages/             ← خالی (shared, ui, tsconfig)
├── docker/               ← docker-compose.yml
├── scripts/              ← backup.sh, deploy.sh, health-check.sh
├── docs/                 ← مستندات
├── logs/                 ← PM2 logs
├── backups/              ← db_*.sql.gz + env_*.bak
├── .env
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── pnpm-lock.yaml
├── .gitignore
├── .editorconfig
└── .npmrc
```

---

## ۴. Stack فنی

### Frontend (`apps/web`)
Next.js 14.2.18, React 18.3.1, Tailwind 3.4, Zustand 5, React Query 5.59, Framer Motion 11, Recharts 3.10, `@react-three/fiber` 8.17 + `three` 0.169 (نصب ولی بلااستفاده), `date-fns-jalali` 4.4.0-0, react-hook-form 7.53, zod 3.23, lucide-react 0.453, next-themes 0.3, Vazirmatn font, PWA دستی (`public/sw.js` + `register-sw.tsx`)

### Backend (`apps/api`)
NestJS 10.4, Prisma 5.20, PostgreSQL 16, Redis 7 (ioredis), MinIO (S3), JWT + passport-jwt, bcrypt (cost 12), speakeasy 2.0, class-validator, helmet, compression, cookie-parser, csurf, express-rate-limit, @nestjs/throttler, @nestjs/schedule, @nestjs/swagger, multer, qrcode

---

## ۵. Prisma Schema — ۹ مدل

فایل: `apps/api/prisma/schema.prisma`

| Model | Table | Notes |
|---|---|---|
| User | users | phone یونیک `09XXXXXXXXX`, password_hash, role, status, twoFaEnabled, twoFaSecret, termsAcceptedAt, termsVersion |
| Family | families | ownerId, plan (free/personal/family/business), maxMembers=6, deletedAt |
| FamilyMember | family_members | familyId+userId یونیک, role, relation, permissions(JSON) |
| Obligation | obligations | userId, title, dueDate, category, priority, status, repeatType, repeatInterval, alertDays(int[]) |
| Asset | assets | userId, type, name, model, year, purchasePrice(BigInt), currentValue(BigInt), metadata(JSON) |
| Transaction | transactions | userId, type(income/expense), category, amount(BigInt), date |
| Budget | budgets | userId+category+period یونیک, amount(BigInt) |
| Notification | notifications | userId, type, title, priority, referenceId, scheduledFor, sentAt, readAt, status |
| Document | documents | userId, name, type, mimeType, size(BigInt), storageKey, bucket, hash(SHA-256), ocrText, encrypted, tags |

### Migrations (۷)
1. `20261005153800_init` — users, families, family_members
2. `20261005205641_add_obligations`
3. `20261005220052_add_assets`
4. `20261006205954_add_finance` — transactions, budgets
5. `20261006214320_add_notifications`
6. `20261006215231_add_documents`
7. `20261007191245_add_terms_and_upload_tracking`

### Data فعلی
۳ user، ۲ family، ۲ member، ۱ asset، ۱ obligation، ۳ document، ۰ transaction، ۰ budget، ۰ notification

---

## ۶. Web Pages (۲۰)

| Route | File |
|---|---|
| `/` | `app/page.tsx` (Landing) |
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |
| `/join/[code]` | `app/join/[code]/page.tsx` |
| `/offline` | `app/offline/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/obligations` | لیست + تکمیل + حذف |
| `/dashboard/obligations/new` | فرم |
| `/dashboard/assets` | لیست |
| `/dashboard/assets/new` | فرم |
| `/dashboard/family` | ساخت + invite |
| `/dashboard/family-tree` | نمایش گرافیکی |
| `/dashboard/finance` | مالی |
| `/dashboard/documents` | آپلود + preview — 🔴 ۲ خطای import |
| `/dashboard/notifications` | لیست |
| `/dashboard/reports` | گزارش‌ها |
| `/dashboard/settings` | ۴ tab |

Layout: `app/layout.tsx` (Root) + `app/dashboard/layout.tsx` (auth guard client-side)

---

## ۷. Web Components

```
components/
├── ui/                    button, card, input
├── landing/               hero, features, how-it-works, pricing, cta
├── layout/                navbar, footer
├── dashboard/             sidebar (desktop), header (mobile + notif bell)
├── providers/             theme-provider, query-provider
├── pwa/                   register-sw, install-prompt
├── search/                search-modal (Ctrl+K)
└── terms/                 terms-modal
```

`lib/api.ts`: ۱۲ namespace — `api`, `authApi`, `obligationsApi`, `assetsApi`, `familyApi`, `financeApi`, `notificationsApi`, `documentsApi`, `settingsApi`, `reportsApi`, `familyTreeApi`, `dashboardApi`, `searchApi`, `termsApi`, `streamDocument`

`stores/auth-store.ts`: Zustand + persist در localStorage (key: `zarvan-auth`)

---

## ۸. API Modules

`main.ts`: helmet + compression + cookieParser + CORS + global prefix `/api` + ValidationPipe + Swagger (dev) + error handler

`app.module.ts`: ConfigModule, ScheduleModule, ThrottlerModule, PrismaModule, RedisModule, MinioModule, ۱۲ ماژول feature, ReminderTask

### Endpoints

- **`/api/auth`**: register, login, send-otp, verify-otp, refresh, logout, profile
- **`/api/family`**: POST، invite، accept/:code، members/:id (PATCH/DELETE)، GET /me، /tree، /:id
- **`/api/obligations`**: POST، GET، /today، /upcoming، /stats، /:id (GET/PATCH/DELETE)، /:id/complete
- **`/api/assets`**: POST، GET، /stats، /:id (GET/PATCH/DELETE)
- **`/api/finance`**: transactions (POST/GET/PATCH/DELETE)، stats، chart، budgets (POST/GET/DELETE)
- **`/api/documents`**: upload، GET، /stats، /:id، /:id/stream، /:id/download، DELETE
- **`/api/notifications`**: GET، /unread-count، /:id/read، /read-all، DELETE، POST
- **`/api/settings`**: profile، password، 2fa/setup|verify|disable، 2fa/backup-codes، 2fa/backup-codes/regenerate، sessions، account (DELETE)
- **`/api/reports`**: dashboard-summary، overview، discipline-history، obligations-by-category، yearly-summary
- **`/api/search`**: GET ?q=&limit=
- **`/api/terms`**: GET، accept، check
- **`/api/health`**: GET (uptime فقط)

### Common
- `PrismaService` — $connect در onModuleInit
- `RedisService` — set/get/del/incr/expire
- `MinioService` — دو client: internal (localhost) + public (دامنه واقعی برای presigned URLs)
- `ReminderTask` — cron روزانه ۸ صبح + هر ۵ دقیقه

---

## ۹. PWA

- `public/manifest.json`: name راتایار، start_url `/dashboard`، standalone، theme `#a855f7`، shortcuts (تعهدات/مالی/اسناد)
- `public/sw.js`: VERSION `v1.0.0`، ۴ cache (static/dynamic/images/api)، استراتژی: static→cache-first، images→stale-while-revalidate، api→network-first، pages→network-first با offline fallback، push handler
- `register-sw.tsx`: تولید production
- `install-prompt.tsx`: beforeinstallprompt + iOS راهنما، `localStorage.pwa-install-dismissed`

---

## ۱۰. Auth Flow (Frontend)

1. Zustand persist در localStorage
2. Token در localStorage (accessToken، refreshToken)
3. axios interceptor: `Authorization: Bearer` + در 401 → refresh → در صورت شکست logout
4. `dashboard/layout.tsx`: useEffect برای redirect
5. **هیچ `middleware.ts` ندارد** (فقط client-side guard)

---

## ۱۱. Design System

- `--primary: 263.4 70% 50.4%` (بنفش)
- `--background: 240 10% 3.9%` (تیره)
- `--radius: 0.75rem`
- Utilities: `.glass`, `.glass-strong`, `.gradient-text`, `.animated-gradient`, `.grid-pattern`, `.bento-item`
- Animations: `gradient`, `float`, `glow`, `shimmer`
- Font: Vazirmatn از next/font/google

---

## ۱۲. Scripts

- `scripts/backup.sh`: pg_dump + cp .env، پاک ۳۰+ روز
- `scripts/health-check.sh`: curl 3000 و 4000، در صورت خطا pm2 restart (**علت حلقه ری‌استارت**)
- `scripts/deploy.sh`: build + check BUILD_ID + restart
- `apps/web/ecosystem.config.js` + `apps/api/ecosystem.config.js`

---

## ۱۳. وضعیت فعلی (2026-10-08)

### ✅ سالم
- API: online، همه routeها map، Prisma/Redis/MinIO متصل، ۹۶ دقیقه uptime
- Docker: ۳ سرویس healthy
- Nginx: config test موفق
- SSL: هر دو دامنه
- `apps/api/dist/main.js` موجود
- `.next/server/app/*` همه page.js دارند

### ⚠️ خطرناک
- **`BUILD_ID` وجود ندارد** در `apps/web/.next/`
- **`zarvan-web` ۲۶۸۰ بار ری‌استارت شده**
- Web الان 200 می‌دهد ولی از **حافظه process** (نه disk)
- **اگر `pm2 restart zarvan-web` بزنیم → می‌ترکد**
- `health-check.sh` هر ۲ دقیقه حلقه می‌سازد

### 🔴 علت شکست build
```
src/app/dashboard/documents/page.tsx(55,20): error TS2304: Cannot find name 'termsApi'.
src/app/dashboard/documents/page.tsx(296,8): error TS2304: Cannot find name 'TermsModal'.
```

### 🐛 باگ‌های runtime
1. `callback.apply is not a function` (transient، ۲۱:۵۶)
2. `Invalid prisma.document.findUnique(): UUID invalid` (۲۲:۴۸)

---

## ۱۴. باگ‌ها (اولویت‌بندی)

### 🔴 فوری
1. `termsApi` + `TermsModal` import نشده — **علت شکست build**
2. `DEV_OTP_ENABLED=true` در production
3. Register OTP verify نمی‌شود
4. 2FA در login چک نمی‌شود
5. Backup codes TTL=0
6. Change password Redis key چک نمی‌شود

### 🟠 مهم
7. `documents.findOne` UUID validate نمی‌کند
8. `documents.stream` کل فایل در RAM
9. `documents.remove` MinIO را پاک نمی‌کند
10. `notifications.process` ارسال نمی‌کند
11. SW API cache بدون auth
12. Token در localStorage
13. `acceptInvite` چک شماره
14. `obligation.assetId` ذخیره نمی‌شود
15. `obligation.remove` hard delete
16. Repeat obligations کار نمی‌کند

### 🟡 نیمه‌مهم
17. `inviteLink` هاردکد
18. assets year شمسی/میلادی
19. `health` فقط uptime
20. `settings.getSessions` fake
21. `confirm()` بومی
22. footer لینک‌های broken
23. navbar `#about`
24. hero placeholder
25. `packages/*` خالی
26. date SSR/TZ

---

## ۱۵. دستورات پرکاربرد

```bash
# Build
cd /var/www/zarvan/apps/web && pnpm build
cd /var/www/zarvan/apps/api && pnpm build

# Type check (بدون build — بی‌خطر)
cd /var/www/zarvan/apps/web && npx tsc --noEmit
cd /var/www/zarvan/apps/api && npx tsc --noEmit

# PM2
pm2 list
pm2 logs zarvan-web --lines 100 --nostream
pm2 restart zarvan-web

# Prisma
cd /var/www/zarvan/apps/api
pnpm prisma generate
pnpm prisma migrate deploy
pnpm prisma studio
docker exec zarvan-postgres psql -U zarvan -d zarvan_db

# Docker
docker compose -f /var/www/zarvan/docker/docker-compose.yml ps

# Nginx
nginx -t
systemctl reload nginx

# Backup
/var/www/zarvan/scripts/backup.sh
```

---

## ۱۶. قوانین طلایی برای AI

### ⛔ هرگز
1. `pm2 restart zarvan-web` بدون `BUILD_ID`
2. `pnpm build` بدون `tsc --noEmit` سبز
3. `prisma migrate` مخرب بدون backup
4. `.env` در جای ناامن
5. `pnpm-lock.yaml` حذف بدون دلیل
6. `node_modules` حذف بدون backup
7. Cron `health-check` غیرفعال بدون جایگزین

### ✅ همیشه
1. قبل از هر تغییر: backup (tar + dump)
2. بعد از هر تغییر: `tsc --noEmit`
3. Migration additive نه مخرب
4. چک PM2 log بعد از تغییر
5. branch جدا برای تغییر بزرگ

---

## ۱۷. مسیر آینده

### فاز E: احیای build (فوری)
1. Backup کامل
2. ۲ خط import در `documents/page.tsx`
3. `tsc --noEmit` → ۰ خطا
4. `pnpm build`
5. `BUILD_ID` چک
6. `pm2 restart zarvan-web`

### فاز F: تثبیت امنیت
- `DEV_OTP_ENABLED=false`
- register OTP verify
- 2FA در login
- UUID validation
- Change password check

### فاز G: کیفیت
- SW cache auth
- documents stream
- notifications واقعی
- obligations repeat
- assets year fix

### فاز H: توسعه
- Git flow
- تست integration
- Nginx → `ratayar.ir` اصلی
- حذف `zarvan.hitanetwork.com`

---

## ۱۸. env keys (بدون مقادیر)

```
NODE_ENV, TZ
DOMAIN, PROTOCOL
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_MAX_CONNECTIONS
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, MINIO_API_PORT, MINIO_CONSOLE_PORT
MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL
MINIO_PUBLIC_ENDPOINT, MINIO_PUBLIC_PORT, MINIO_PUBLIC_USE_SSL
JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
API_PORT, API_URL, WEB_URL
DATABASE_URL
DEV_OTP_ENABLED, SMS_PROVIDER, KAVENEGAR_API_KEY, KAVENEGAR_SENDER
SMS_API_KEY, PAYMENT_API_KEY, OPENAI_API_KEY
```

⚠️ بعد از هر چت عمومی، پسوردها را روتیت کن.

---

## ۱۹. خط زمانی مشکل build

```
2026-10-05 18:43 — شروع
2026-10-05 22:46 — migration init
2026-10-07 20:xx — تلاش next-pwa
2026-10-07 21:00 — "Could not find production build"
2026-10-07 21:01 — بازنویسی next.config.mjs
2026-10-07 21:02 — "Cannot find .next/server/pages/_error.js"
2026-10-07 21:04 — restart موفق
2026-10-07 21:06 — "Cannot find .next/server/app/_not-found/page.js"
2026-10-07 21:48 — همان
2026-10-07 21:54 — **BUILD_ID فعلی از اینجا**
2026-10-07 22:47 — آخرین build شکست، BUILD_ID پاک شد
2026-10-07 22:48 — اولین UUID error
2026-10-08 — web از memory، در آستانه فروپاشی
```

---

## ۲۰. پایان سند

**اگر AI هستی:**
۱. اول این سند را کامل بخوان.
۲. فقط فایل‌های لازم تسک فعلی را بخوان.
۳. قبل از هر تغییر، backup بگیر.
۴. از قوانین طلایی تبعیت کن.
۵. بعد از هر تغییر، سند را آپدیت کن.

**این سند = حقیقت پروژه. اگر با کد مغایرت داشت، کد را مبنا بگیر.**

---

*ساخته‌شده در 2026-10-08 با خواندن کامل ۱۰۰+ فایل پروژه، لاگ‌ها، تنظیمات، دیتابیس و زیرساخت.*


