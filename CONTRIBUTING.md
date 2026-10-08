# راهنمای مشارکت در پروژه راتایار

> این سند **الزامی** است. هر تغییر کد، بدون رعایت این قوانین، merge نخواهد شد.

---

## 🎯 قاعده طلایی

**هر تغییر کد = یک commit + به‌روزرسانی مستندات مربوطه.**

کدی که مستند نشده باشد، انگار نوشته نشده است.

---

## 📋 چک‌لیست هر تغییر (اجباری)

قبل از هر commit:

- [ ] کد تغییر یافته و تست شده
- [ ] `npx tsc --noEmit` = صفر خطا
- [ ] `pnpm build` = موفق
- [ ] `pm2 logs` = بدون خطای جدید
- [ ] ورودی در `docs/CHANGELOG.md` زیر `[Unreleased]` اضافه شد
- [ ] ورودی در `docs/KNOWN-ISSUES.md` به‌روزرسانی شد (اگر باگ بود)
- [ ] Commit message با فرمت استاندارد
- [ ] `git push` انجام شد

---

## 📝 فرمت Commit Message

<type>(<scope>): <subject>

<body — چرا این تغییر لازم بود>
Fix:

<تغییر ۱>

<تغییر ۲>

Resolves: <ID از KNOWN-ISSUES> (اگر مربوط بود)



| type | کاربرد |
|---|---|
| `fix` | رفع باگ |
| `feat` | قابلیت جدید |
| `docs` | فقط مستندات |
| `refactor` | بازنویسی بدون تغییر رفتار |
| `chore` | کارهای جانبی |
| `test` | افزودن/اصلاح تست |

### نمونه:


---

## 📂 ساختار مستندات

| فایل | چه زمانی به‌روزرسانی شود |
|---|---|
| `docs/CHANGELOG.md` | **همیشه** — هر تغییر قابل توجه |
| `docs/KNOWN-ISSUES.md` | فقط اگر باگ جدید کشف/رفع شد |
| `docs/ARCHITECTURE.md` | فقط اگر ساختار یا معماری تغییر کرد |
| `docs/QUICKSTART.md` | فقط اگر مراحل راه‌اندازی تغییر کرد |
| `PROJECT-MEMORY.md` | فقط برای تغییرات بزرگ یا milestone |

---

## 🏷 شناسه‌گذاری باگ‌ها (Issue ID)

| پیشوند | حوزه |
|---|---|
| `SEC-NNN` | امنیت |
| `API-NNN` | بک‌اند / API |
| `WEB-NNN` | فرانت‌اند |
| `PWA-NNN` | PWA / Service Worker |
| `DB-NNN` | پایگاه داده / Migration |
| `BUILD-NNN` | build / deploy / زیرساخت |

---

## 🌿 Git Flow

| Branch | کاربرد |
|---|---|
| `main` | Production — همیشه قابل deploy |
| `feat/<name>` | فیچر جدید |
| `fix/<name>` | رفع باگ |
| `hotfix/<name>` | رفع فوری روی main |

### چرخه کار:

1. از `main` branch بگیر: `git checkout -b fix/api-001-uuid`
2. تغییر بده + مستندات را به‌روز کن
3. Commit + push
4. PR به `main` بزن
5. بعد از تأیید، merge و تگ بزن

---

## ✅ Definition of Done

یک کار وقتی «تمام» است که:

1. کد نوشته، تست، و build شده
2. مستندات (CHANGELOG + KNOWN-ISSUES) به‌روز شده
3. Commit message استاندارد دارد
4. Push شده روی remote
5. اگر فیچر است: در `docs/ARCHITECTURE.md` توضیح داده شده
6. اگر باگ است: در `KNOWN-ISSUES.md` از Open به Resolved منتقل شده

---

## 🚫 ممنوع

- commit بدون پیام واضح (`git commit -m "fix"`)
- commit بدون به‌روزرسانی CHANGELOG
- push مستقیم به `main` (مگر hotfix با اطلاع تیم)
- گذاشتن `.env`، کلید، یا توکن در repo
- گذاشتن `dist/`، `node_modules/`، یا فایل‌های temp در git

---

**آخرین به‌روزرسانی:** 2026-10-08
