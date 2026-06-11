# theRandomizr

Randomize anything — movies, dinners, names, your entire Letterboxd watchlist, any list.

Feed in data from any **source**, pick any **method**:

| Sources | Methods |
|---|---|
| Typed lists (one per line) | Roulette Wheel |
| Built-in presets (movies, food, names, games…) | Card Draw |
| Spreadsheets (CSV / TSV upload, Google Sheets link) | Slot Machine |
| Images (upload, drag-drop, or URL) | Ladder Lottery (amidakuji) |
| Letterboxd (RSS by username, or CSV export) | Tournament (single elimination) |
| Goodreads (shelf RSS) | Team Splitter |
| Saved lists (localStorage) | Dice Roll |
| Share links (`?share=` — a whole list in a URL) | Number Generator |
| Number ranges | Coin Flip |
| | Timeline Shuffle (full random ordering) |

Results are recorded to a local history. Lists save to your browser — no account needed.
Any list can be copied as a share link and opened on someone else's machine.

## Design

Monochrome, like the 2010 original: ink on warm paper, halftone dot fields, hard
offset shadows, sharp corners. Display type is BPdots Bold (the original brand
font), everything else is IBM Plex Mono. Emphasis is inversion, never color.
The 2010 site lives in [`og/`](og/) for posterity.

## Stack

- **Vite + React 19 + TypeScript** — SPA
- **Tailwind CSS v4** — styling (custom monochrome token system in `index.css`)
- **Framer Motion** — physics on the randomizer stages (wheel, slots, dice, coin)
- **Supabase** — Postgres, Auth, Storage, Realtime (group rooms, planned)
- **React Router** — client-side routing

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase keys if connecting
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the built bundle |
| `npm run lint` | ESLint |

## Layout

```
src/
  components/
    methods/       Wheel, Cards, Slots, Ladder, Bracket, Teams,
                   Dice, NumberGen, Coin, Timeline
    source/        SourcePanel (type / presets / images / sheet / watchlists / saved)
    Logo.tsx       dotted-R mark
  pages/           Home, Randomize (/randomize/:method), Lists
  lib/             random (crypto RNG), csv (+ Google Sheets), letterboxd,
                   goodreads, share (?share= links), proxy, presets, storage, types
  state/           ItemsContext + useItems (shared list + history)
og/                2010 original (read-only archive)
public/fonts/      BPdots Bold (original brand font)
```

## Env

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
