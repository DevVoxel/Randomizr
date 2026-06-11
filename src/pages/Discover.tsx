import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { Channel, DiscoverCard } from '../lib/discover'
import { CHANNELS } from '../lib/discover'
import { useItems } from '../state/useItems'

export default function Discover() {
  const { recordResult } = useItems()
  const [active, setActive] = useState<Channel | null>(null)
  const [card, setCard] = useState<DiscoverCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(false)
  const seq = useRef(0)

  const pull = async (channel: Channel) => {
    const mySeq = ++seq.current
    setActive(channel)
    setLoading(true)
    setError('')
    setRevealed(false)
    try {
      const result = await channel.pull()
      if (mySeq !== seq.current) return
      setCard(result)
      recordResult({ id: crypto.randomUUID(), label: result.title, image: result.image, method: 'discover' })
    } catch (e) {
      if (mySeq !== seq.current) return
      setCard(null)
      setError(e instanceof Error ? e.message : 'That channel went quiet')
    } finally {
      if (mySeq === seq.current) setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24">
      <header className="pt-12 pb-6 border-b-2 border-foreground">
        <h1 className="font-brand text-5xl sm:text-6xl">Discover</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Random things pulled live from the world's public APIs. Pick a channel,
          pull the lever, get something you were not looking for.
        </p>
      </header>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* channel rack */}
        <div className="flex flex-col">
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => pull(c)}
              disabled={loading}
              className={`group text-left border-b-2 border-foreground px-3 py-3 transition-colors ${
                active?.id === c.id
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted'
              } first:border-t-2`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{c.name}</span>
                {loading && active?.id === c.id ? (
                  <Loader2 className="size-4 animate-spin shrink-0" />
                ) : (
                  <span className={`text-[10px] uppercase tracking-[0.15em] ${active?.id === c.id ? 'text-background/60' : 'text-muted-foreground'}`}>
                    pull
                  </span>
                )}
              </span>
              <span className={`block text-xs mt-0.5 ${active?.id === c.id ? 'text-background/70' : 'text-muted-foreground'}`}>
                {c.note}
              </span>
            </button>
          ))}
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            Channels are public, keyless APIs. NASA's demo key allows a few dozen
            pulls per hour, so the sky occasionally closes.
          </p>
        </div>

        {/* the result */}
        <div className="min-h-[420px]">
          {error && (
            <div className="ink-card p-5">
              <p className="text-sm font-semibold underline decoration-wavy">{error}</p>
              <p className="text-xs text-muted-foreground mt-2">Public APIs have moods. Pull again or try another channel.</p>
            </div>
          )}

          {!card && !error && !loading && (
            <div className="border-2 border-dashed border-muted-foreground/50 p-10 text-center">
              <div className="halftone-faint size-16 mx-auto mb-4" aria-hidden />
              <p className="text-sm text-muted-foreground">Pick a channel on the left. The world goes on the right.</p>
            </div>
          )}

          {loading && !card && (
            <div className="border-2 border-foreground p-10 text-center">
              <Loader2 className="size-6 animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">consulting the universe</p>
            </div>
          )}

          {card && (
            <motion.article
              key={card.title + (card.sub ?? '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ink-card hard-shadow overflow-hidden"
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="w-full max-h-[420px] object-contain bg-muted grayscale contrast-110 border-b-2 border-foreground"
                />
              )}
              {card.embedUrl && (
                <iframe
                  src={card.embedUrl}
                  title="Map of the random location"
                  className="w-full h-80 border-b-2 border-foreground grayscale contrast-110"
                  loading="lazy"
                />
              )}
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">{card.kicker}</p>
                <h2 className="font-brand text-3xl leading-none break-words">{card.title}</h2>
                {card.sub && <p className="text-sm text-muted-foreground mt-2">{card.sub}</p>}

                {card.lines && (
                  <div className="mt-4 text-sm leading-7 whitespace-pre-line border-l-4 border-foreground pl-4">
                    {card.lines.join('\n')}
                  </div>
                )}

                {card.body && <p className="mt-4 text-sm leading-6 line-clamp-6">{card.body}</p>}

                {card.facts && (
                  <dl className="mt-4 text-sm max-w-md">
                    {card.facts.map(([k, v]) => (
                      <div key={k} className="flex gap-3 py-1.5 border-b border-dotted border-muted-foreground/50">
                        <dt className="w-28 shrink-0 font-semibold">{k}</dt>
                        <dd className="text-muted-foreground min-w-0 break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {card.answer && (
                  <button
                    onClick={() => setRevealed(true)}
                    className={`mt-4 px-4 py-2 text-sm font-semibold border-2 border-foreground ${
                      revealed ? 'bg-foreground text-background cursor-default' : 'hover:bg-muted'
                    }`}
                  >
                    {revealed ? card.answer : 'Reveal the answer'}
                  </button>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {active && (
                    <button onClick={() => pull(active)} disabled={loading} className="btn-ink px-5 py-2 text-sm font-semibold inline-flex items-center gap-2">
                      {loading && <Loader2 className="size-4 animate-spin" />}
                      Pull again
                    </button>
                  )}
                  {card.link && (
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-[0.15em] underline underline-offset-2 decoration-2 hover:decoration-dotted"
                    >
                      {card.linkLabel ?? 'source →'}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </main>
  )
}
