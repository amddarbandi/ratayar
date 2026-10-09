# Copy Review — tagline revisions

> User directive 2026-10-10: the phrase "دستیار هوشمند زندگی از ۷ سال
> تا ۱۰۰ سال" must be replaced or removed. Proposed alternatives below.

## Current (in use — must change)

- **in footer.tsx**: "دستیار هوشمند زندگی از ۷ سال تا ۱۰۰ سال — مدیریت
  تعهدات، دارایی‌ها، اسناد و خانواده در یک اپ."
- **in navbar/hero**: possibly similar in hero.tsx

## Rules

- No age range (۷ سال تا ۱۰۰ سال) — user finds it off-putting
- Short, confident, warm — not boastful
- Persian, RTL native

## Proposed replacements

### Option 1 — Direct benefit
> دستیار هوشمند زندگی — تعهدات، دارایی، خانواده و اسناد، همه در یک‌جا

### Option 2 — Emotional
> زندگی را ساده‌تر، منظم‌تر و امن‌تر کن

### Option 3 — Practical, benefit-first
> هیچ تعهدی فراموش نمی‌شود، هیچ هزینه‌ای از قلم نمی‌افتد

### Option 4 — Family-centered
> برای خانواده‌هایی که می‌خواهند زندگی‌شان را منظم نگه دارند

### Option 5 — Simple and neutral
> دستیار هوشمند مدیریت زندگی روزمره

### Option 6 — Remove entirely
Leave only the LogoWordmark + short tagline "پلتفرم دیگری از گروه
مهندسی راتا".

## Decision

Pending user selection. Apply chosen text to:
- apps/web/src/components/layout/footer.tsx
- apps/web/src/components/landing/hero.tsx (if present)
- apps/web/src/app/layout.tsx (metadata description)
- any docs / PWA manifest / metadata

Last updated: 2026-10-10
