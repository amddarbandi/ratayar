# UI/UX Guidelines — MANDATORY

## Rule 1 — One visual language across the entire platform

Every page — user dashboard, admin panel, public pages, modals, forms,
empty states — must use the SAME visual system:

- Dark glass theme (bg-white/5, bg-white/10, border-white/10)
- Neon accent gradients (purple → cyan for user, red → orange for admin)
- Rounded-2xl cards
- text-white / text-white/60 / text-white/40 hierarchy
- framer-motion for entry animations
- Same icon set (lucide-react)
- Same spacing scale
- Same typography (RTL, Persian)

## Rule 2 — Forbidden

- Light backgrounds (bg-gray-50, bg-white) on any authenticated page
- Different color palettes per page
- Raw HTML forms with default browser styling
- Different card shapes/shadows
- Inconsistent icon sizes
- 3D icons on one page and flat on another
- Mixed UI kits

## Rule 3 — Use shared components

Every page MUST use:
- @/components/ui/card     (Card, CardContent)
- @/components/ui/button   (Button, all variants)
- @/components/ui/input    (Input)
- @/components/ui/modal    (Modal)
- @/components/common/*    (shared helpers)

Never write raw <div className="bg-white ..."> for surfaces.

## Rule 4 — Page shell

Every dashboard page wrapped like:
```tsx
<div className="space-y-6">
  <div>
    <h1 className="text-3xl font-bold text-white mb-1">Title</h1>
    <p className="text-white/50">Subtitle</p>
  </div>
  {/* content */}
</div>


No min-h-screen, no bg-gray-*.

Rule 5 — Homepage is the showcase
The public homepage is the shop window. It must:

Show a live preview / mockup of the actual dashboard

Demonstrate value visually, not just with text

Match the same dark glass aesthetic as the product

Feel impressive to a first-time visitor

Rule 6 — Every UI change verified visually
Build succeeds, route 200, screenshot review when possible.

Rule 7 — No page ships looking different
If a new page cannot match the design system yet, hide it behind a
feature flag until it does.

Last updated: 2026-10-08
