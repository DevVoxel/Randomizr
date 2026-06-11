import { Link } from 'react-router-dom'
import { METHODS } from '../lib/types'
import { PRESETS } from '../lib/presets'
import { DotR } from '../components/Logo'

const SOURCES: [string, string][] = [
  ['typed list', 'one item per line, done'],
  ['spreadsheet', 'csv · tsv · google sheets link'],
  ['images', 'drag-drop, upload, or paste a url'],
  ['letterboxd', 'watchlist via rss or csv export'],
  ['goodreads', 'any shelf, via rss'],
  ['share link', 'every list fits in a url'],
]

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      {/* hero: set like a poster, not a SaaS pitch */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center pt-14 pb-16 border-b-2 border-foreground">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            fifteen methods · est. 2010
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
              or browse all fifteen ↓
            </a>
          </div>
        </div>
        {/* the dotted R, oversized, on a halftone field: the 2010 grids again */}
        <div className="hidden lg:flex justify-center halftone-faint py-10" aria-hidden>
          <DotR className="h-64 w-auto text-foreground" />
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

      {/* sources: a spec sheet */}
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
    </main>
  )
}
