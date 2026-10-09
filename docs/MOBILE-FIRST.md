# Mobile-First — MANDATORY

> **User directive 2026-10-09:** The platform must look and feel
> excellent on a phone first. 90%+ of users connect from mobile.
> A desktop-perfect / mobile-awful product fails 100%.

## Why this is not optional

- Users visit from a phone on the go.
- If they cannot read text without pinch-zoom, they leave.
- If a button is too small to tap, they curse and close the tab.
- If a card overflows horizontally, they see a broken site.

## Rules

### R1 — Design for 360px width first

The primary target is a **360x640** Android phone.
Every page must be designed for that width FIRST, then expanded up.
Desktop is the enhancement, not the baseline.

### R2 — Minimum tap target: 44 x 44 px

Any button, link, or interactive element must be tappable at 44px.
Small icon buttons are forbidden inside cards unless wrapped in a
larger tappable area.

### R3 — Minimum body text: 14px

- body:        text-sm (14px) minimum
- captions:    text-xs (12px) only for truly secondary labels
- never:       text-[10px], text-[11px] as base text
- headings scale down: text-4xl md:text-6xl, not text-6xl alone

### R4 — No horizontal scroll

Every page tested at 360px width. No overflow-x anywhere.
Long strings (IP, hex, URLs) must use break-all.
Tables must collapse to cards on mobile.

### R5 — Sidebar collapses to bottom nav or drawer

Current desktop sidebar (hidden lg:flex) means mobile users see no
navigation at all. Must add:
- hamburger drawer on tablet (md)
- bottom fixed nav bar on phones (5 primary items + "more" sheet)

### R6 — Padding scales

- p-8 desktop -> p-4 on mobile
- gap-6 desktop -> gap-3 on mobile
- Use responsive Tailwind classes (p-4 md:p-8)

### R7 — Cards single-column on mobile

- grid-cols-1 on phone
- md:grid-cols-2
- lg:grid-cols-3 or 4

Already mostly true but must be verified page by page.

### R8 — Forms use full-width inputs on mobile

Inputs must be w-full, font-size 16px minimum (prevents iOS zoom).

### R9 — Every new component verified at 360px

Before committing any UI change:
1. open devtools
2. toggle device toolbar
3. pick iPhone SE (375) OR Android Small (360)
4. screenshot review
5. only then commit

### R10 — No "hidden md:..." as the only navigation

Anything hidden on mobile must have a mobile replacement.

## Audit checklist (per page)

- [ ] 360px width: no horizontal scroll
- [ ] All tap targets >= 44px
- [ ] Body text >= 14px
- [ ] Navigation reachable (drawer or bottom bar)
- [ ] Grids collapse to 1 column
- [ ] Cards use full width minus 16px padding
- [ ] Charts/numbers readable without zoom
- [ ] Forms: full width, >= 16px font

## Implementation plan

See ROADMAP.md section "Mobile-First Audit".

Priority:
1. Bottom nav / hamburger drawer (blocks all mobile use)
2. Typography scale audit
3. Per-page layout audit
4. Chart / sparkline sizing
5. Forms

Last updated: 2026-10-09
