# حادثه 2026-11-23 — قطعی سایت به‌دلیل خاموش بودن Nginx

- **تاریخ کشف:** 2026-11-23
- **شروع خرابی:** 2026-10-31 22:00 (ری‌استارت سرور)
- **مدت خرابی:** ~۲۳ روز (کشف تأخیری)
- **شدت:** High
- **وضعیت:** برطرف شد + پیشگیری دائمی

## علت ریشه‌ای

سرویس nginx روی وضعیت `disabled` بود. سرور در 2026-10-31 22:00 ری‌استارت شد و Nginx خودکار بالا نیامد. از آن تاریخ، پورت‌های 80 و 443 هیچ سرویسی نداشتند. Next.js روی 127.0.0.1:3000 سالم بود ولی از بیرون قابل دسترسی نبود.

## چرا کاربران «بهم‌ریختگی» دیدند به‌جای «قطعی»

Service Worker (next-pwa) نسخه قدیمی HTML را در Cache Storage نگه داشته بود:

- درخواست صفحه → از cache پاسخ داده می‌شد ✓
- درخواست CSS → https://ratayar.ir/_next/static/css/... → Connection refused ✗
- نتیجه: HTML بدون CSS = ظاهر بهم‌ریخته

## نشانه‌ها

- مرورگر ناشناس: ERR_CONNECTION_REFUSED روی 443
- curl https://ratayar.ir/ از سرور: Connection refused
- systemctl status nginx → Active: inactive (dead) و disabled
- curl http://127.0.0.1:3000/ → 200 OK
- journalctl -u nginx → آخرین Started در 2026-10-31 22:00

## اقدامات رفع

1. sudo systemctl start nginx → سایت فوراً با HTTP/2 200 برگشت
2. sudo systemctl enable nginx → ماندگار برای بوت‌های بعدی
3. پاک‌سازی Service Worker در مرورگر کاربر (Unregister + Clear site data)
4. تأیید: systemctl is-active nginx pm2-root → active active

## پیشگیری دائمی

1. nginx enabled — تأیید شد
2. pm2-root enabled — تأیید شد
3. nginx-watchdog systemd timer — راه‌اندازی شد (docs/ops/nginx-watchdog.md)
4. تست بازیابی — 2026-11-23 22:38 با موفقیت انجام شد

## درس‌ها

- هر سرویس حیاتی باید enabled باشد، نه فقط active
- Service Worker نباید HTML را کش کند
- monitoring خارجی (UptimeRobot) لازم است
- pm2 save باید بعد از هر تغییر مهم اجرا شود

## TODO‌های مرتبط

- [ ] pm2 save برای به‌روزرسانی dump.pm2 با وضعیت فعلی
- [ ] راه‌اندازی UptimeRobot برای هشدار خارجی
- [ ] تنظیم Service Worker که HTML کش نکند
