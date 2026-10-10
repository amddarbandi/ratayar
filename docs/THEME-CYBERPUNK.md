# Theme: Cyberpunk Emerald

> User decision 2026-10-10: replace current theme with a dark
> cyberpunk look — high-contrast neon on matte black.

## Palette

| Role              | Hex        | Tailwind alias         |
|-------------------|------------|------------------------|
| Base (matte black)| #08080b    | bg-base                |
| Surface 1         | #0f0f16    | bg-surface             |
| Surface 2         | #15151d    | bg-surface-2           |
| Primary (brand)   | #10ffb3    | brand (neon emerald)   |
| Secondary         | #22d3ee    | brand-2 (electric cyan)|
| Accent (badges)   | #e935ff    | accent (neon magenta)  |
| Success           | #22ff8a    | ok                     |
| Warning           | #ffb020    | warn                   |
| Danger            | #ff3d7f    | danger                 |

## Gradients

- Primary: `linear-gradient(135deg, #10ffb3, #22d3ee)` — brand
- Highlight: `linear-gradient(135deg, #22d3ee, #e935ff)` — accent
- Danger:   `linear-gradient(135deg, #ff3d7f, #ffb020)`

## Rules

- Body text: white, with #ffffff/60, /50, /40 for hierarchy
- Cards: subtle dark glass (bg-white/[0.03–0.07]) with `border-white/10`
- No pure black (#000) — always #08080b or the surfaces above
- No light backgrounds anywhere
- Focus rings: brand color at 40% opacity
- Buttons: gradient for primary CTA, ghost/outline for secondary

## Migration plan

1. Add CSS variables to globals.css
2. Extend tailwind.config.ts with semantic colors + gradients
3. Add utility classes: `.btn-brand`, `.badge-accent`, `.glow-brand`
4. Global replace of `from-purple-*` / `to-cyan-*` / `via-fuchsia-*`
   with the new semantic classes — via python batch, per folder:
   - components/ui + components/brand (foundation)
   - components/landing (public pages)
   - components/dashboard (user dashboard)
   - app/admin (admin panel)
   - components/market, /common, /plans (feature widgets)
5. Verify each folder with safe-build + curl 200
6. Screenshot verify page by page

## Order of execution

- Foundation   (globals + tailwind + ui)
- Landing      (hero, dashboard-preview, pricing, footer, cta)
- Dashboard    (sidebar, mobile-nav, header, all pages)
- Admin        (layout + 15 pages)
- Feature sets (market, converters, network, calendar)
