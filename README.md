<div align="center">

# راتایار

**دستیار هوشمند زندگی از ۷ سال تا ۱۰۰ سال**

[![Status](https://img.shields.io/badge/status-v0.95-yellow)]()
[![License](https://img.shields.io/badge/license-Private-red)]()
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)]()
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-orange)]()

</div>

---

## معرفی

**راتایار** یک وب‌اپلیکیشن PWA است که نقش دستیار شخصی، خانوادگی و کسب‌وکار را ایفا می‌کند.

مشکل: مردم ده‌ها تعهد کوچک و بزرگ دارند (بیمه، معاینه فنی، دارو، مالیات، اجاره، مدرسه). فراموشی = جریمه، دیرکرد، خطر جانی.

راه‌حل: یک منشی فعال که تعهدات را از دارایی‌ها استخراج می‌کند، از قبل هشدار می‌دهد، تصمیم پیشنهاد می‌دهد، سند نگه می‌دارد، هزینه می‌شمارد و خانواده را به هم وصل می‌کند.

---

## وضعیت پروژه

- **نسخه:** `v0.95` (MVP — تقریباً کامل)
- **دامنه production:** [ratayar.ir](https://ratayar.ir)
- **وضعیت build:** ⚠️ در حال رفع — علت: ۲ خطای import در `documents/page.tsx`
- **API:** ✅ سالم
- **PWA:** ✅ نصب‌شدنی روی Android/iOS/Desktop

جزئیات کامل در [`PROJECT-MEMORY.md`](./PROJECT-MEMORY.md) و [`docs/`](./docs/).

---

## استک فنی

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS 3** + custom design system
- **Zustand** (state) + **TanStack Query** (data)
- **Framer Motion** (animation)
- **Recharts** (charts)
- **PWA** دستی (Service Worker + Manifest)

### Backend
- **NestJS 10** + **TypeScript**
- **Prisma 5** + **PostgreSQL 16**
- **Redis 7** (cache/session/lockout)
- **MinIO** (object storage، S3-compatible)
- **JWT** + **bcrypt** + **speakeasy** (2FA TOTP)

### Infrastructure
- **PM2** (process manager)
- **Nginx** (reverse proxy + SSL)
- **Docker** (Postgres + Redis + MinIO)
- **Let's Encrypt** (SSL)

---

## ساختار

```
zarvan/
├── apps/
│   ├── web/          # Next.js 14
│   └── api/          # NestJS 10
├── packages/         # shared, ui, tsconfig (خالی)
├── docker/           # docker-compose.yml
├── scripts/          # backup, deploy, health-check
├── docs/             # مستندات
├── PROJECT-MEMORY.md # حافظه کامل پروژه
└── README.md
```

---

## راه‌اندازی سریع

### پیش‌نیازها
- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### نصب

```bash
git clone <repo-url>
cd zarvan
cp .env.example .env  # و مقادیر را پر کن
pnpm install
```

### دیتابیس

```bash
docker compose -f docker/docker-compose.yml up -d
cd apps/api
pnpm prisma generate
pnpm prisma migrate deploy
```

### اجرا در dev

```bash
# ترمینال ۱ — API
cd apps/api && pnpm dev

# ترمینال ۲ — Web
cd apps/web && pnpm dev
```

### دسترسی

| سرویس | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:4000/api |
| Swagger | http://localhost:4000/api/docs |
| Prisma Studio | `pnpm --filter @zarvan/api prisma:studio` |

---

## Build و Production

```bash
# ۱. Type check (اجباری)
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit

# ۲. Build
cd apps/web && pnpm build
cd apps/api && pnpm build

# ۳. Restart PM2
pm2 restart zarvan-web zarvan-api
```

**⚠️ هرگز `pm2 restart zarvan-web` نزن اگر `apps/web/.next/BUILD_ID` وجود ندارد.**

---

## مستندات

| سند | توضیح |
|---|---|
| [`PROJECT-MEMORY.md`](./PROJECT-MEMORY.md) | حافظه کامل پروژه — هر AI/توسعه‌دهنده باید بخواند |
| [`docs/QUICKSTART.md`](./docs/QUICKSTART.md) | راه‌اندازی سریع |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | معماری فنی |
| [`docs/KNOWN-ISSUES.md`](./docs/KNOWN-ISSUES.md) | باگ‌های شناخته‌شده |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | تاریخچه تغییرات |

---

## قوانین طلایی

1. **قبل از `pm2 restart`، `BUILD_ID` را چک کن.**
2. **قبل از `pnpm build`، `tsc --noEmit` باید سبز باشد.**
3. **قبل از هر تغییر بزرگ، backup بگیر.**
4. **قبل از `prisma migrate` مخرب، backup بگیر.**
5. **`.env` را هرگز commit نکن.**

---

## لایسنس

Private — تمام حقوق محفوظ است.

---

<div align="center">

**ساخته شده با ❤️ در ایران**

</div>
