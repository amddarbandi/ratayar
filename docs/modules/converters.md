# Frontend: Converters (کانورت‌ها)

Paths:
- apps/web/src/lib/unit-conversions.ts         — data + math
- apps/web/src/app/dashboard/converters/page.tsx — UI
Status: done (CALC-001 to CALC-010, CALC-004..007, CALC-009)

## Purpose

Friendly, all-ages unit converter. No file conversion.

## Categories (10, 74 units total)

| key         | label              | emoji | units |
|-------------|--------------------|-------|-------|
| weight      | وزن و جرم           | ⚖️    | 8     |
| length      | طول و فاصله         | 📏    | 8     |
| volume      | حجم و ظرفیت        | 🧪    | 8     |
| temperature | دما                 | 🌡️    | 3     |
| area        | مساحت              | 🗺️    | 8     |
| time        | زمان                | ⏱️    | 8     |
| data        | حجم داده            | 💾    | 6     |
| speed       | سرعت                | 🏎️    | 5     |
| pressure    | فشار                | 💨    | 6     |
| energy      | انرژی               | ⚡    | 6     |

Also includes Iranian local units: نخود, مثقال (weight).

## UX

- Category grid: emoji + name + glow, hover scale, staggered entry
- Converter panel:
  - FROM input (big number, RTL-agnostic)
  - SWAP button (gradient, animated on hover)
  - TO output (gradient bubble, copy button with success check)
  - Quick reference: 1 unit -> all other units in the category
- All Persian, RTL, dark glass, purple-cyan accents

## Conversion math

- Linear units: `factor` to base (kg for weight, m for length, L for
  volume, m² for area, s for time, byte for data, m/s for speed,
  Pa for pressure, J for energy)
- Temperature: toBase/fromBase functions (°C as base)
- Never in floating-point loops; single multiply then divide
- Result formatting: exponential for >= 1e9 or < 1e-4, otherwise
  fa-IR locale with up to 6 decimals

## Sidebar

Added to dashboard sidebar between storage and reports:
  { href: '/dashboard/converters', label: 'کانورت‌ها', icon: Repeat }

## Future

- Currency conversion (PRICE-008) — will plug into the same panel
- Persist last category / unit pair in localStorage
- "Copy as plain text" share
