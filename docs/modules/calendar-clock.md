# Frontend: Calendar & Clock (تقویم)

Paths:
- apps/web/src/lib/clock.ts              — Hijri, prayer times, events
- apps/web/src/app/dashboard/calendar/   — page
Status: done (CLOCK-001..010 first pass)

## Purpose

time.ir-style page: analog clock, three calendars, prayer times,
events, holiday status.

## lib/clock.ts

- CITIES: Tehran, Mashhad, Isfahan, Shiraz, Tabriz (lat/lng)
- toHijri / toHijriString — Umm al-Qura via Intl.DateTimeFormat
- getPrayerTimes — adhan, CalculationMethod.Tehran()
- getNextPrayer — nearest upcoming of fajr/sunrise/dhuhr/asr/maghrib/isha
- formatTime / formatTimeSec
- EVENTS — 40+ entries (official holidays + occasions) by Jalali m/d
- isHoliday(jm, jd, date) — Friday or holiday event

## UI

- Analog SVG clock:
  - round or square (toggle button)
  - hour/minute/second hands (purple/cyan/red gradients)
  - 12 numbered markers + 60 tick marks
  - center glow dot
- Digital clock (HH:MM:SS, tabular-nums, RTL-immune)
- Weekday label
- Dates card: Jalali (long + numeric), Gregorian, Hijri
- 'امروز تعطیل است' badge when Friday or holiday event
- Next prayer card: label + time + countdown (h/m)
- Prayer times grid: 6 cells (فجر، طلوع، ظهر، عصر، مغرب، عشا) — RTL
- Today's events list with 'تعطیل رسمی' badge

## City selector

Buttons in header (Tehran default). Recomputed on change.

## Menus

- Sidebar: تقویم (Calendar icon)
- Homepage navbar: تقویم (before IP)
