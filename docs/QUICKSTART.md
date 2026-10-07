# Quickstart — راه‌اندازی سریع

راهنمای گام‌به‌گام برای توسعه‌دهنده جدید که می‌خواهد پروژه را لوکال اجرا کند.

---

## پیش‌نیازها

| ابزار | نسخه | چرا |
|---|---|---|
| Node.js | 20+ | runtime |
| pnpm | 9+ | package manager |
| Docker | 24+ | برای Postgres, Redis, MinIO |
| Git | هر نسخه | version control |

---

## ۱. Clone

```bash
git clone git@github.com:ratayar-ir/<repo>.git
cd <repo>
```

---

## ۲. Environment

```bash
cp .env.example .env
nano .env  # مقادیر را پر کن
```

**حداقل متغیرهای الزامی:**
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `JWT_SECRET` (حداقل ۳۲ کاراکتر تصادفی)
- `DATABASE_URL`

---

## ۳. نصب پکیج‌ها

```bash
pnpm install
```

**نکته:** پروژه `node-linker=hoisted` دارد، همه پکیج‌ها در `node_modules` روت نصب می‌شوند.

---

## ۴. راه‌اندازی زیرساخت

```bash
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml ps
```

انتظار: ۳ سرویس healthy/running.

---

## ۵. دیتابیس

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate deploy
cd ../..
```

**چک:**
```bash
docker exec zarvan-postgres psql -U zarvan -d zarvan_db -c "\dt"
```

باید ۱۰ جدول ببینی (۹ مدل + `_prisma_migrations`).

---

## ۶. اجرا در حالت development

**ترمینال ۱ — API:**
```bash
cd apps/api
pnpm dev
```

**ترمینال ۲ — Web:**
```bash
cd apps/web
pnpm dev
```

---

## ۷. دسترسی

| سرویس | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:4000/api |
| Swagger | http://localhost:4000/api/docs |
| Health | http://localhost:4000/api/health |
| Prisma Studio | `cd apps/api && pnpm prisma:studio` |

---

## ۸. چک سلامت

```bash
curl http://localhost:4000/api/health
curl -o /dev/null -w "web: %{http_code}\n" http://localhost:3000
```

---

## ۹. قبل از commit

```bash
cd apps/web && npx tsc --noEmit
cd ../api && npx tsc --noEmit
```

هر دو باید ۰ خطا بدهند.

---

## ۱۰. دستورات پرکاربرد

```bash
# ساخت migration جدید (بعد از تغییر schema.prisma)
cd apps/api
pnpm prisma migrate dev --name <name>

# اعمال migration در production
pnpm prisma migrate deploy

# ریست دیتابیس (فقط در dev!)
pnpm prisma migrate reset

# لاگ‌ها
pm2 logs zarvan-web
pm2 logs zarvan-api

# بکاپ
./scripts/backup.sh
```

---

## مشکلات رایج

### خطای `Cannot find production build`
- `apps/web/.next/BUILD_ID` وجود ندارد
- راه‌حل: `cd apps/web && pnpm build`

### خطای `Cannot find module '@prisma/client'`
- `pnpm prisma generate` را در `apps/api` بزن

### خطای Docker port conflict
- چک کن چیزی روی 5432/6379/9000 گوش نمی‌دهد: `ss -tlnp`

### خطای `EADDRINUSE` روی 3000/4000
- PM2 قبلی هنوز در حال اجراست: `pm2 list && pm2 delete all`

---

## قوانین طلایی

1. **قبل از `pm2 restart zarvan-web`، `BUILD_ID` را چک کن.**
2. **قبل از `pnpm build`، `tsc --noEmit` سبز باشد.**
3. **قبل از `prisma migrate`, backup بگیر.**
4. **`.env` را commit نکن.**
5. **`pnpm-lock.yaml` را دستی تغییر نده — با `pnpm add/remove` آپدیت کن.**
