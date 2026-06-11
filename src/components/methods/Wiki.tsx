import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { WikiCard } from '../../lib/wiki'
import { randomArticle, randomPerson, randomOnThisDay } from '../../lib/wiki'

type Pull = 'article' | 'person' | 'onthisday'

const PULLS: { id: Pull; label: string; blurb: string; fetcher: () => Promise<WikiCard> }[] = [
  { id: 'article', label: 'Random article', blurb: 'anything at all', fetcher: randomArticle },
  { id: 'person', label: 'Random person', blurb: 'a biography', fetcher: randomPerson },
  { id: 'onthisday', label: 'On this day', blurb: 'a moment in history', fetcher: randomOnThisDay },
]

export default function Wiki({ onLabel }: { onLabel: (label: string) => void }) {
  const [card, setCard] = useState<WikiCard | null>(null)
  const [loading, setLoading] = useState<Pull | null>(null)
  const [error, setError] = useState('')
  const seq = useRef(0)

  const pull = async (p: (typeof PULLS)[number]) => {
    const mySeq = ++seq.current
    setLoading(p.id)
    setError('')
    try {
      const result = await p.fetcher()
      if (mySeq !== seq.current) return // a newer pull superseded this one
      setCard(result)
      onLabel(result.title)
    } catch (e) {
      if (mySeq !== seq.current) return
      setError(e instanceof Error ? e.message : 'Wikipedia did not answer')
    } finally {
      if (mySeq === seq.current) setLoading(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <div className="flex flex-wrap justify-center gap-2">
        {PULLS.map((p) => (
          <button
            key={p.id}
            onClick={() => pull(p)}
            disabled={loading !== null}
            className="btn-paper px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            {loading === p.id && <Loader2 className="size-4 animate-spin" />}
            {p.label}
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-60">{p.blurb}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-semibold underline decoration-wavy">{error}</p>}

      {card && (
        <motion.article
          key={card.url + card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ink-card hard-shadow w-full"
        >
          {card.image && (
            <img
              src={card.image}
              alt=""
              className="w-full max-h-56 object-cover grayscale contrast-110 border-b-2 border-foreground"
              loading="lazy"
            />
          )}
          <div className="p-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
              {card.meta ?? 'wikipedia'}
            </p>
            <h3 className="font-brand text-3xl leading-none break-words">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 line-clamp-6">{card.extract}</p>
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs uppercase tracking-[0.15em] underline underline-offset-2 decoration-2 hover:decoration-dotted"
            >
              read on wikipedia →
            </a>
          </div>
        </motion.article>
      )}

      {!card && !loading && (
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Six million articles, one button between you and a random one.
          Live from Wikipedia, dressed in this site's ink.
        </p>
      )}
    </div>
  )
}
