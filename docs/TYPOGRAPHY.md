# Typography Scale — MANDATORY

## Minimum sizes

| Context | Mobile | Desktop |
|---|---|---|
| Body text | 14px (text-sm) | 14px |
| Secondary / caption | 12px (text-xs) | 12-14px |
| Icon-attached label / badge | 11px | 12-14px |
| Bottom-nav labels | 11px | n/a (mobile only) |
| Form input | 16px (iOS zoom prevention) | 16px |

## Forbidden

- `text-[10px]` as the only size for text a user must read
- `text-[10px]` on desktop (too small at 27" monitors)
- Body text below 14px

## Allowed exceptions

- Timestamps inside dense tables on desktop (but still >= 11px)
- Binary representations (IP/hex) where 4-char groups need to fit
  horizontally — those use `text-xs` and `break-all` for mobile

## Conversion map (for future edits)

- `text-[10px]` -> `text-[11px] md:text-xs`
- `text-[11px]` -> `text-xs md:text-sm`
- `text-[12px]` -> `text-xs md:text-sm`
- body content    -> `text-sm md:text-base`

## Verification

Run before commit:

    grep -rn 'text-\[10px\]' src/ | wc -l   # should be 0 in dashboard/admin

Last updated: 2026-10-10
