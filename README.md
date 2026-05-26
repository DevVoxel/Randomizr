# Randomizr

Randomize anything fun — movies, games, names, food, music, images, news, lists, anything.

The 2010 original lives in [`og/`](og/) for posterity.

## Stack

- **Vite + React 19 + TypeScript** — SPA
- **Tailwind CSS v4 + shadcn/ui (Radix)** — styling + accessible primitives
- **Framer Motion + GSAP** — UI motion + physics-based reveals (slot, wheel, dice)
- **Supabase** — Postgres, Auth, Storage, Realtime (group rooms)
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
  components/ui/   shadcn primitives
  pages/           route components
  lib/             utils, supabase client
  hooks/           react hooks
og/                2010 original (read-only archive)
```

## Adding a shadcn component

```bash
npx shadcn@latest add button card dialog tabs input
```

## Env

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
