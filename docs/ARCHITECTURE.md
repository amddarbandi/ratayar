# Architecture

نمای فنی کامل پروژه راتایار.

---

## نمای کلی

```
┌─────────────────────────────────────────────────────────┐
│  کاربر (Browser / PWA / Mobile)                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Nginx (Reverse Proxy + SSL)                            │
│  ├── /_next/static/ → cache 1y                          │
│  ├── /sw.js → no-cache                                  │
│  ├── /api/ → API (port 4000)                            │
│  ├── /documents/ → MinIO (port 9000)                    │
│  └── / → Next.js (port 3000)                            │
└─────┬───────────────────┬───────────────────────┬───────┘
      │                   │                       │
      ▼                   ▼                       ▼
┌──────────┐       ┌──────────┐           ┌──────────┐
│Next.js 14│       │NestJS 10 │           │  MinIO   │
│ port 3000│       │ port 4000│           │ port 9000│
└────┬─────┘       └────┬─────┘           └────┬─────┘
     │                  │                       │
     │                  │                       │
     │                  ├──► Postgres 16 ◄──────┘
     │                  │   port 5432
     │                  │
     │                  └──► Redis 7
     │                      port 6379
     │
     └──── (از طریق API) ──► Kavenegar SMS (خارجی)
```

---

## لایه‌ها

### ۱. Client Layer

**Next.js 14 App Router** + PWA

- ۲۰ route (صفحه)
- ۴ route group: `(auth)`, `dashboard`, `join`, root
- Server Components پیش‌فرض، Client Components با `'use client'`
- PWA: `public/sw.js` + `manifest.json` + `register-sw.tsx`
- State: Zustand (`auth-store`)
- Data: React Query (client-side caching)
- HTTP: axios با interceptor (`lib/api.ts`)

### ۲. Edge Layer

**Nginx** — reverse proxy + SSL termination

- Let's Encrypt SSL برای دو دامنه
- Gzip compression
- Cache-Control برای static assets
- WebSocket upgrade passthrough
- Client max body 100MB (برای آپلود اسناد)

### ۳. Application Layer

**NestJS 10** — modular monolith

**۱۳ ماژول feature:**
1. `auth` — ثبت‌نام، ورود، OTP، 2FA، refresh
2. `family` — خانواده، invite، tree
3. `obligations` — تعهدات
4. `assets` — دارایی‌ها
5. `finance` — تراکنش، بودجه
6. `documents` — آپلود سند
7. `notifications` — اعلان‌ها
8. `settings` — پروفایل، رمز، 2FA
9. `reports` — گزارش‌ها
10. `search` — جستجوی سراسری
11. `terms` — شرایط
12. `health` — بررسی سلامت
13. `common/*` — Prisma، Redis، MinIO، Tasks

**الگو:** Controller → Service → Prisma

- Controller: routing + validation (DTO) + guards
- Service: business logic
- Prisma: data access

### ۴. Data Layer

**PostgreSQL 16** (main data)
- ۹ مدل Prisma
- ۷ migration
- Indexes روی fk + status + date

**Redis 7** (cache/session/lockout)
- `otp:{phone}` — TTL 300s
- `otp:ratelimit:{phone}` — ۵ در ساعت
- `lockout:{phone}` — ۵ تلاش در ۱۵ دقیقه
- `invite:{code}` — TTL 7 روز
- `invite:phone:{phone}` — reverse lookup
- `blacklist:{jti}` — refresh token revocation
- `pwd-changed:{userId}` — بعد از تغییر رمز (⚠️ چک نمی‌شود)

**MinIO** (object storage)
- Bucket: `documents`
- Storage key: `{userId}/{type}/{timestamp}-{hash8}.{ext}`
- Presigned URLs برای download
- Public endpoint برای URL معتبر (به‌جای localhost)

### ۵. Cron Layer

**@nestjs/schedule** — reminder.task.ts

- `0 8 * * *` (Asia/Tehran) — checkObligationReminders
- `EVERY_5_MINUTES` — processScheduledNotifications

**crontab** (system-level)

- `*/2 * * * *` — health-check.sh
- `0 3 * * *` — backup.sh

---

## جریان‌های اصلی

### ثبت‌نام
```
POST /api/auth/send-otp {phone}
  → generate 6-digit code
  → redis.set('otp:{phone}', code, 300)
  → SMS via Kavenegar (فعلاً نمایش در response)
  → return {success, code (dev)}

POST /api/auth/register {phone, password, fullName, otpCode?}
  ⚠️ otpCode verify نمی‌شود (باگ SEC-002)
  → bcrypt.hash(password, 12)
  → prisma.user.create
  → generateTokens(userId, phone)
  → return {user, accessToken, refreshToken}
```

### ورود
```
POST /api/auth/login {phone, password}
  → redis.get('lockout:{phone}') ≥ 5 → 401
  → prisma.user.findUnique
  → bcrypt.compare
  → ⚠️ twoFaEnabled چک نمی‌شود (باگ SEC-003)
  → redis.del('lockout:{phone}')
  → generateTokens
```

### رفرش Token
```
POST /api/auth/refresh {refreshToken}
  → jwt.verify
  → redis.exists('blacklist:{jti}') → 401
  → generateTokens
  → redis.set('blacklist:{old_jti}', true, 30d)
```

### آپلود سند
```
POST /api/documents/upload (multipart)
  → multer: memory storage, 50MB limit
  → mime whitelist check
  → createHash('sha256').update(buffer)
  → storageKey = "{userId}/{type}/{ts}-{hash8}.{ext}"
  → minio.uploadFile(storageKey, buffer, mime, size)
  → prisma.document.create
  → return document metadata
```

### دانلود سند
```
GET /api/documents/{id}/download
  → findOne (with ownership check)
  → minio.getPresignedUrlWithHeaders (1h expiry)
  → return {url, name, size}

GET /api/documents/{id}/stream
  → findOne
  → minio.getFile → Buffer
  → res.end(buffer)
  ⚠️ کل فایل در RAM (باگ API-002)
```

### ساخت خانواده
```
POST /api/family {name, plan}
  → check existing owned family
  → prisma.family.create
  → prisma.familyMember.create (role='owner', relation='self')
```

### دعوت عضو
```
POST /api/family/invite {phone, role, relation}
  → check member limit
  → generateInviteCode() → "RTY-XXXX-XXXX"
  → redis.set('invite:{code}', JSON, 7d)
  → redis.set('invite:phone:{phone}', code, 7d)
  → return {code, link} ⚠️ link هاردکد (API-009)
```

### Accept Invite
```
POST /api/family/accept/{code}
  → redis.get('invite:{code}')
  → check existing member
  → check member limit
  ⚠️ چک نمی‌کند invite.phone === user.phone (باگ API-005)
  → prisma.familyMember.create
  → redis.del('invite:{code}')
```

---

## امنیت

### احراز هویت
- JWT با HS256
- Access token: 15 دقیقه
- Refresh token: 30 روز
- Blacklist در Redis برای logout/refresh
- JWT Strategy: چک `user.status === 'active'` و `!deletedAt`

### رمزنگاری
- Passwords: bcrypt cost 12
- 2FA: TOTP با speakeasy (SHA-1, 30s, 6 digits, window ±1)
- Backup codes: 8 کد 8 رقمی (⚠️ TTL=0)

### Rate limiting
- Throttler global: 100 req/min (in-memory)
- Login lockout: ۵ تلاش / ۱۵ دقیقه
- OTP rate limit: ۵ درخواست / ساعت / شماره

### Headers (Helmet)
- CSP (disabled در dev)
- crossOriginEmbedderPolicy: false
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### CORS
- `[WEB_URL, ratayar.ir, www.ratayar.ir]`
- credentials: true

### Validation
- class-validator در همه DTOها
- ValidationPipe: whitelist + forbidNonWhitelisted
- در production: `disableErrorMessages=true`

---

## مقیاس‌پذیری

**فعلاً:**
- تک سرور
- تک process API + تک process Web (PM2 fork mode)
- PostgreSQL تک instance
- Redis تک instance
- MinIO تک instance

**برای مقیاس:**
- PM2 cluster mode برای API
- PostgreSQL read replicas
- Redis Cluster
- MinIO distributed
- CDN برای static

---

## Deployment

### ۱. Deploy کد
```bash
cd /var/www/zarvan
git pull
pnpm install --frozen-lockfile
```

### ۲. Migrate DB (اگر schema تغییر کرده)
```bash
cd apps/api
pnpm prisma migrate deploy
```

### ۳. Build API
```bash
cd apps/api
pnpm build
```

### ۴. Build Web (با احتیاط!)
```bash
cd apps/web
npx tsc --noEmit  # باید صفر بدهد
pnpm build         # باید BUILD_ID تولید کند
ls .next/BUILD_ID  # چک
```

### ۵. Restart
```bash
pm2 restart zarvan-api
pm2 restart zarvan-web
pm2 save
```

### ۶. تأیید
```bash
curl -s http://localhost:4000/api/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
pm2 list
```

---

## فایل‌های کلیدی

### Backend
| فایل | نقش |
|---|---|
| `apps/api/src/main.ts` | Bootstrap |
| `apps/api/src/app.module.ts` | Module tree |
| `apps/api/prisma/schema.prisma` | Data model |
| `apps/api/src/common/prisma/prisma.service.ts` | DB connection |
| `apps/api/src/common/redis/redis.service.ts` | Cache wrapper |
| `apps/api/src/common/minio/minio.service.ts` | Object storage |
| `apps/api/src/common/tasks/reminder.task.ts` | Cron jobs |

### Frontend
| فایل | نقش |
|---|---|
| `apps/web/src/app/layout.tsx` | Root layout (RTL, theme, providers) |
| `apps/web/src/app/page.tsx` | Landing |
| `apps/web/src/app/dashboard/layout.tsx` | Auth guard + shell |
| `apps/web/src/lib/api.ts` | HTTP client + همه APIها |
| `apps/web/src/stores/auth-store.ts` | Auth state |
| `apps/web/public/sw.js` | Service Worker |
| `apps/web/next.config.mjs` | Next.js config |

### Infra
| فایل | نقش |
|---|---|
| `docker/docker-compose.yml` | DB/Redis/MinIO |
| `scripts/backup.sh` | DB backup |
| `scripts/health-check.sh` | Health cron |
| `scripts/deploy.sh` | Safe deploy |
| `apps/web/ecosystem.config.js` | PM2 web |
| `apps/api/ecosystem.config.js` | PM2 api |
| `/etc/nginx/sites-enabled/zarvan` | Nginx |
| `.env` | Environment |

---

## تصمیمات کلیدی

### چرا Next.js 14 App Router؟
- Server Components پیش‌فرض
- Streaming SSR
- Built-in font optimization
- PWA-friendly

### چرا NestJS؟
- ساختار modular طبیعی
- DI container قدرتمند
- Decorator-based validation
- Swagger auto-gen

### چرا Prisma؟
- Type-safe queries
- Migration system قوی
- Prisma Studio برای dev
- جامعه بزرگ

### چرا Redis؟
- Lockout + rate limit
- OTP TTL
- Token blacklist
- Session tracking (future)

### چرا MinIO (نه S3 مستقیم)?
- Self-hosted، بدون هزینه ابری
- S3-compatible API
- Presigned URLs
- مناسب ایران

### چرا PWA (نه Native)?
- یک codebase برای همه
- نصب بدون App Store
- به‌روزرسانی فوری
- حجم کم

---

## نقاط ضعف فعلی

1. **بدون Git** — version control ندارد
2. **بدون تست** — هیچ test file وجود ندارد
3. **بدون CI/CD** — همه چیز دستی
4. **بدون monitoring** — فقط PM2 logs
5. **بدون error tracking** — Sentry یا معادل ندارد
6. **Token در localStorage** — XSS vulnerable
7. **بدون middleware** — auth guard فقط client-side
8. **بدون GraphQL** — REST-only (قابل قبول برای MVP)
9. **بدون WebSocket** — real-time notification ندارد
10. **بدون search engine** — Prisma ILIKE (کند در مقیاس)

این‌ها در roadmap هستند.
