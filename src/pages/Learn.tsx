import { Link } from 'react-router-dom'
import { ARTICLES } from '../lib/articles'

export default function Learn() {
  const [lead, ...rest] = ARTICLES

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      <header className="pt-12 pb-6 border-b-2 border-foreground flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-brand text-5xl sm:text-6xl">The Entropy Press</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Short, honest articles on where random numbers actually come from:
            the math, the physics, and the lava lamps.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          all editions free · no cookies harmed
        </p>
      </header>

      {/* lead story, broadsheet style */}
      <Link
        to={`/learn/${lead.slug}`}
        className="group block border-b-2 border-foreground py-8 hover:bg-foreground hover:text-background transition-colors px-2"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground group-hover:text-background/70 mb-2">
          lead story · {lead.minutes} min
        </p>
        <h2 className="font-brand text-4xl sm:text-5xl leading-none max-w-3xl">{lead.title}</h2>
        <p className="mt-3 text-sm max-w-2xl text-muted-foreground group-hover:text-background/80">{lead.deck}</p>
      </Link>

      <div className="grid sm:grid-cols-3 border-b-2 border-foreground">
        {rest.map((a, i) => (
          <Link
            key={a.slug}
            to={`/learn/${a.slug}`}
            className={`group block py-6 px-2 sm:px-5 hover:bg-foreground hover:text-background transition-colors border-foreground ${
              i > 0 ? 'sm:border-l-2 border-t-2 sm:border-t-0' : ''
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground group-hover:text-background/70 mb-2">
              {a.minutes} min
            </p>
            <h2 className="font-brand text-2xl leading-tight">{a.title}</h2>
            <p className="mt-2 text-xs text-muted-foreground group-hover:text-background/80 line-clamp-3">{a.deck}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 ink-card hard-shadow-sm p-5 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">in the works</p>
        <p className="text-sm">
          A camera pointed at a lava lamp, hashed frame by frame into this site's
          entropy. The design notes are in{' '}
          <Link to="/learn/the-lava-lamp-wall" className="underline underline-offset-2 decoration-2 hover:decoration-dotted">
            Entropy you can point a camera at
          </Link>
          . When the lamp goes live, it gets a page of its own.
        </p>
      </div>
    </main>
  )
}
