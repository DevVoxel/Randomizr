import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { METHODS } from '../lib/types'
import { PRESETS } from '../lib/presets'
import { ARTICLES } from '../lib/articles'
import { pick } from '../lib/random'
import { DotR } from '../components/Logo'

const SOURCES: [string, string][] = [
  ['typed list', 'one item per line, done'],
  ['spreadsheet', 'csv · tsv · google sheets link'],
  ['images', 'drag-drop, upload, or paste a url'],
  ['letterboxd', 'watchlist via rss or csv export'],
  ['goodreads', 'any shelf, via rss'],
  ['wikipedia', 'six million articles, live'],
  ['share link', 'every list and verdict fits in a url'],
]

const FATES = [
  'Yes.', 'No.', 'Obviously.', 'Absolutely not.', 'Do it.', "Don't.",
  'Without question.', 'Not today.', 'Ask out loud first.', 'Flip again, coward.',
]

/* one-tap oracle: the cheapest possible taste of the whole site */
function InstantFate() {
  const [fate, setFate] = useState<string | null>(null)
  const [round, setRound] = useState(0)
  return (
    <div className="flex items-center gap-4 min-h-12">
      <button
        onClick={() => { setFate(pick(FATES)); setRound((r) => r + 1) }}
        className="btn-paper px-4 py-2 text-sm font-semibold"
      >
        {fate ? 'Decide again' : 'Decide something now'}
      </button>
      <AnimatePresence mode="popLayout">
        {fate && (
          <motion.span
            key={round}
            initial={{ opacity: 0, scale: 1.4, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="font-brand text-2xl bg-foreground text-background px-3 py-1 inline-block"
          >
            {fate}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

const DISCOVER: { label: string; to: string; note: string }[] = [
  { label: 'a Wikipedia article', to: '/randomize/wiki', note: 'live from 6,000,000' },
  { label: 'a person from history', to: '/randomize/wiki', note: 'biographies only' },
  { label: 'a moment in time', to: '/randomize/wiki', note: 'on this day, any year' },
  { label: 'a chemical element', to: '/randomize/wheel?preset=elements', note: 'all 118 on one wheel' },
  { label: 'a spirit animal', to: '/randomize/cards?preset=animals', note: 'drawn from a deck' },
  { label: 'a shape', to: '/randomize/plinko?preset=shapes', note: 'decided by gravity' },
]

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      {/* hero: set like a poster, not a SaaS pitch */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center pt-14 pb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            {METHODS.length} methods · est. 2010
          </p>
          <h1 className="font-brand text-6xl sm:text-7xl md:text-8xl leading-[0.95]">
            Randomize
            <br />
            anything.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed">
            A wheel, a deck, six dice, a ladder, and zero opinions. Paste a list
            (movies, dinners, chores, coworkers) and stop arguing about it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to="/randomize/wheel" className="btn-ink inline-block px-7 py-3 font-semibold">
              Spin the wheel
            </Link>
            <a href="#methods" className="text-sm underline underline-offset-4 decoration-2 hover:decoration-dotted">
              or browse all {METHODS.length} ↓
            </a>
          </div>
          <div className="mt-8 border-t-2 border-dotted border-muted-foreground/50 pt-4">
            <InstantFate />
          </div>
        </div>
        {/* the dotted R, oversized, on a halftone field: the 2010 grids again */}
        <div className="hidden lg:flex justify-center halftone-faint py-10" aria-hidden>
          <DotR className="h-64 w-auto text-foreground" />
        </div>
      </section>

      {/* randomize the world, not just your list */}
      <section className="border-y-2 border-foreground py-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
          No list? Randomize the world
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DISCOVER.map((d) => (
            <Link
              key={d.label + d.to}
              to={d.to}
              className="group border-2 border-dashed border-foreground px-4 py-3 hover:border-solid hover:bg-foreground hover:text-background transition-colors"
            >
              <span className="block font-semibold text-sm">{d.label}</span>
              <span className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground group-hover:text-background/70 mt-1">
                {d.note}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* methods: a printed program listing, not a card grid */}
      <section id="methods" className="pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
          The methods
        </h2>
        <ol className="border-t-2 border-foreground">
          {METHODS.map((m, i) => (
            <li key={m.id}>
              <Link
                to={`/randomize/${m.id}`}
                className="group flex items-baseline gap-4 border-b-2 border-foreground px-2 py-4 hover:bg-foreground hover:text-background transition-colors"
              >
                <span className="font-brand text-2xl w-10 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold text-lg whitespace-nowrap">{m.name}</span>
                <span className="flex-1 border-b-2 border-dotted border-muted-foreground/50 group-hover:border-background/50 translate-y-[-4px] min-w-8" />
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground group-hover:text-background/80 whitespace-nowrap">
                  {m.tagline}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* sources + presets */}
      <section className="grid md:grid-cols-2 gap-10 pt-16">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
            Feed it anything
          </h2>
          <dl className="text-sm">
            {SOURCES.map(([term, def]) => (
              <div key={term} className="flex gap-3 py-2 border-b border-dotted border-muted-foreground/50">
                <dt className="w-32 shrink-0 font-semibold">{term}</dt>
                <dd className="text-muted-foreground">{def}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Lists and history live in your browser. No account, nothing uploaded.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
            Or grab a ready-made list
          </h2>
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((p) => (
              <Link
                key={p.id}
                to={`/randomize/wheel?preset=${p.id}`}
                className="border-2 border-dashed border-foreground px-4 py-2 text-sm hover:border-solid hover:bg-foreground hover:text-background transition-colors"
              >
                {p.name}
                <span className="ml-2 text-xs opacity-60">×{p.items.length}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* the press: education is part of the product */}
      <section className="pt-16">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            From the Entropy Press
          </h2>
          <Link to="/learn" className="text-xs underline underline-offset-2 decoration-2 hover:decoration-dotted">
            all editions →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
          {ARTICLES.slice(0, 4).map((a) => (
            <Link key={a.slug} to={`/learn/${a.slug}`} className="group border-b border-dotted border-muted-foreground/50 pb-3">
              <span className="font-semibold text-sm group-hover:underline underline-offset-2">{a.title}</span>
              <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">{a.deck}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
