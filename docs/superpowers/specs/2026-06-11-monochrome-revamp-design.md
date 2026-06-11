# theRandomizr — monochrome revamp + depth

**Date:** 2026-06-11
**Status:** approved (user delegated: "do what you think is right")

## Design identity statement

> The 2010 black-on-white dot-grid site rebuilt by someone who has spent fifteen
> years setting type: ink on warm paper, halftone-gray dots, hard offset shadows,
> and an inverted black stamp when chance speaks.

## Why

Current UI is the AI-slop checklist: glassmorphism, violet/fuchsia gradients,
glow, dark-mode + neon, bento cards, fade-up on every element, "Accept your
fate" copy. The 2010 original (`og/`) was black text on white with gray dot
grids — the monochrome identity the user asked for is the site's own heritage.

## Visual system

- **Palette (strict monochrome):** paper `oklch(0.97 0.005 90)` (warm white),
  ink `oklch(0.2 0.01 80)`, two grays. No accent color. Emphasis = inversion
  (white-on-black blocks). Contrast trivially passes WCAG.
- **Type:** BPdots Bold (existing, local) for display, headings, numbers.
  IBM Plex Mono 400/600 (Google Fonts, `font-display: swap`) for everything
  else — ticket/punch-card voice. No Inter, no Poppins.
- **Shape:** sharp corners everywhere (radius 0). Solid 1–2px ink borders.
  Interactive cards get hard offset shadows (`4px 4px 0 ink`), pressed state
  shifts them. No blur, no glass, no glow, no gradients.
- **Texture:** halftone dot patterns (SVG/radial-gradient) echo the og
  `.grid2-gray` blocks. Wheel slices use monochrome pattern fills (solid ink,
  halftone, stripes, paper) instead of 8 rainbow colors.
- **Motion:** physics on the randomizer stages stays (that's content). All
  decorative fade-ups die. One hero moment only. `prefers-reduced-motion`
  respected.
- **Copy voice:** dry arcade-operator. Specific, terse, no "seamless", no
  power verbs, no emoji headers.

## Feature additions

1. **Three new methods** (7 → 10), all algorithmically distinct:
   - `ladder` — Amidakuji / ghost-leg lottery: items at top, outcomes at
     bottom, random rungs, animated path tracing.
   - `bracket` — single-elimination tournament: RNG decides each matchup
     round by round; full run reveals a champion.
   - `teams` — splits the list into N random groups (Fisher-Yates then chunk).
2. **Spreadsheet import** — new Source tab: upload `.csv`/`.tsv` (reuse the
   existing CSV parser, extracted to `lib/csv.ts`), pick which column holds
   labels when there are several; paste a published Google Sheets link
   (transformed to its CSV export URL, which is CORS-open).
3. **Goodreads** joins Letterboxd in an "Import" tab — public shelf RSS via
   the same CORS-proxy fallback chain.
4. **Share links** — `lib/share.ts` encodes the current list into a
   `?share=` URL param (base64 JSON, labels + meta only); Randomize decodes
   it on load. Copy-link button next to the current list.

## Architecture

- `lib/csv.ts` — generic CSV/TSV parsing + Google Sheets URL→CSV transform
  (letterboxd.ts re-imports parseCsv from here).
- `lib/goodreads.ts` — shelf RSS fetch, same proxy list as letterboxd.
- `lib/share.ts` — encode/decode list ↔ URL param, size-capped.
- `components/methods/Ladder|Bracket|Teams.tsx` — same `items/onResult`
  contract as existing methods; Stage switch in Randomize.tsx gains 3 cases.
- `types.ts` — MethodId union + METHODS entries grow; `accent` (tailwind
  gradient string) is replaced by a monochrome `fill` pattern token.
- Everything else is restyling existing components in place.

## Error handling

- Sheets/RSS fetches: timeout + proxy fallback + readable error strings
  (pattern already in letterboxd.ts).
- Share param: malformed base64/JSON silently ignored, app loads normally.
- CSV with no usable column: explicit "no text column found" message.

## Testing

No test runner configured; verification = `npm run build` (tsc) +
Playwright walkthrough of every method and source tab at 360px and 1280px.

## Out of scope

Supabase group rooms, accounts, weighted items, xlsx parsing (CSV covers the
ask without a 1 MB dependency), Steam/Spotify (no CORS-viable public feeds).
