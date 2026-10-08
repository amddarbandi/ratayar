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
- [ ] ورودی در `docs/CHANGELOG.md` زیر `[Unreleased]`
- [ ] ورودی در `docs/KNOWN-ISSUES.md` (اگر باگ بود)
- [ ] Commit message با فرمت استاندارد
- [ ] `git push` انجام شد

---

## 📝 فرمت Commit Message

[200~<type>(<scope>): <subject>

<body>
Fix:

<تغییر ۱>

Resolves: <ID>~

| type | کاربرد |
|---|---|
| `fix` | رفع باگ |
| `feat` | قابلیت جدید |
| `docs` | فقط مستندات |
| `refactor` | بازنویسی |
| `chore` | کار جانبی |
| `test` | تست |

نمونه:


---

## 📂 مستندات

| فایل | زمان به‌روزرسانی |
|---|---|
| `CHANGELOG.md` | همیشه |
| `KNOWN-ISSUES.md` | باگ جدید/رفع |
| `ARCHITECTURE.md` | تغییر معماری |
| `QUICKSTART.md` | تغییر راه‌اندازی |

---

## 🏷 شناسه باگ‌ها

| پیشوند | حوزه |
|---|---|
| `SEC-` | امنیت |
| `API-` | بک‌اند |
| `WEB-` | فرانت‌اند |
| `PWA-` | Service Worker |
| `DB-` | پایگاه داده |
| `BUILD-` | زیرساخت |

---

## 🌿 Git Flow

| Branch | کاربرد |
|---|---|
| `main` | Production |
| `feat/<name>` | فیچر جدید |
| `fix/<name>` | رفع باگ |
| `hotfix/<name>` | رفع فوری |

---

## ✅ Definition of Done

1. کد تست و build شده
2. CHANGELOG + KNOWN-ISSUES به‌روز شده
3. Commit message استاندارد
4. Push شده

---

## 🚫 ممنوع

- commit بدون پیام
- commit بدون CHANGELOG
- push مستقیم به `main`
- `.env` / توکن در repo
- `dist/` / `node_modules/` در git

---

**آخرین به‌روزرسانی:** 2026-10-08
