# nginx-watchdog — راهنمای بهره‌برداری

## هدف

اگر nginx خاموش شود، در حداکثر ۲ دقیقه خودکار روشن می‌شود. هیچ کار دیگری انجام نمی‌دهد.

## فایل‌ها

| مسیر | نقش |
|---|---|
| /usr/local/sbin/nginx-watchdog.sh | اسکریپت (۱۲ خط) |
| /etc/systemd/system/nginx-watchdog.service | واحد systemd |
| /etc/systemd/system/nginx-watchdog.timer | تایمر (هر ۲ دقیقه) |
| /var/log/nginx-watchdog.log | لاگ اقدامات |
| /etc/nginx-watchdog.hold | کلید نگه‌داری دستی (اختیاری) |

## بررسی وضعیت

    systemctl is-active nginx-watchdog.timer
    systemctl list-timers nginx-watchdog.timer --no-pager
    cat /var/log/nginx-watchdog.log

در حالت عادی، لاگ خالی است.

## نگه‌داری دستی (قبل از تعمیرات)

    touch /etc/nginx-watchdog.hold
    # ... تعمیرات ...
    rm /etc/nginx-watchdog.hold

چک بعد از هر تعمیر:

    ls /etc/nginx-watchdog.hold 2>/dev/null && echo "hold exists — watchdog OFF" || echo "armed"

## تست بازیابی

تأییدشده در 2026-11-23 22:38 — ACTION + OK در لاگ ثبت شد و سایت با HTTP/2 200 برگشت.

    touch /etc/nginx-watchdog.hold
    systemctl stop nginx
    rm /etc/nginx-watchdog.hold
    sleep 180
    curl -sI https://ratayar.ir/ | head -1
    cat /var/log/nginx-watchdog.log

## حذف کامل

    systemctl disable --now nginx-watchdog.timer
    rm -f /etc/systemd/system/nginx-watchdog.timer \
          /etc/systemd/system/nginx-watchdog.service \
          /usr/local/sbin/nginx-watchdog.sh \
          /etc/nginx-watchdog.hold
    systemctl daemon-reload

## ریسک‌ها

| ریسک | احتمال | تأثیر |
|---|---|---|
| nginx سالم باشد و watchdog اشتباهاً کاری کند | صفر | شرط is-active جلوی آن را می‌گیرد |
| کانفیگ nginx خراب باشد | ممکن | فقط لاگ پر می‌شود |
| باگ در اسکریپت | بسیار کم (۱۲ خط ساده) | حداکثر یک start بی‌اثر |
| تداخل با PM2 | صفر | به PM2 کار ندارد |
