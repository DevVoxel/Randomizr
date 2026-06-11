import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Item } from '../../lib/types'
import { pickIndex, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

// straws thin out as the list grows; every item always gets one
const LONG = 120
const SHORT = 64
const REVEAL_MS = 700

interface Round {
  order: Item[]
  shortIdx: number
}

export default function Straws({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [round, setRound] = useState<Round | null>(null)
  const [revealed, setRevealed] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  const build = () => {
    window.clearTimeout(timerRef.current)
    const order = shuffle(items)
    setRound({ order, shortIdx: pickIndex(order.length) })
    setRevealed(false)
  }

  const pull = () => {
    if (!round || revealed) return
    setRevealed(true)
    timerRef.current = window.setTimeout(() => {
      onResult(round.order[round.shortIdx])
    }, REVEAL_MS)
  }

  const winner = round && revealed ? round.order[round.shortIdx] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {round && (
        <div className="flex flex-col items-center w-full max-w-2xl">
          <div className="flex items-end justify-center gap-px sm:gap-0.5 w-full" style={{ height: LONG + 24 }}>
            {round.order.map((item, i) => {
              const isShort = i === round.shortIdx
              return (
                <button
                  key={item.id}
                  onClick={pull}
                  disabled={revealed}
                  aria-label={revealed ? `${item.label}: ${isShort ? 'short straw' : 'long straw'}` : `Pull straw ${i + 1}`}
                  className="relative flex flex-1 max-w-7 min-w-1 flex-col items-center justify-end group"
                  style={{ height: LONG }}
                >
                  <motion.div
                    animate={{ height: revealed ? (isShort ? SHORT : LONG) : LONG - 28 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={`w-full max-w-2 min-w-[3px] ${revealed && isShort ? 'bg-foreground' : 'bg-foreground/80'} ${!revealed ? 'group-hover:bg-foreground' : ''}`}
                  />
                </button>
              )
            })}
          </div>
          {/* the fist: straws disappear into it until pulled */}
          <div className="h-9 w-full bg-foreground relative -mt-1 halftone" style={{ backgroundImage: 'radial-gradient(circle, var(--paper) 1.2px, transparent 1.3px)', backgroundSize: '8px 8px', backgroundColor: 'var(--ink)' }} />
          <ol className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs w-full max-w-md max-h-36 overflow-y-auto">
            {round.order.map((item, i) => (
              <li
                key={item.id}
                className={`truncate ${revealed && i === round.shortIdx ? 'bg-foreground text-background px-1 font-semibold' : 'text-muted-foreground'}`}
              >
                {i + 1}· {item.label}
              </li>
            ))}
          </ol>
        </div>
      )}

      <button onClick={round && !revealed ? pull : build} className="btn-ink px-8 py-3 font-semibold text-lg">
        {!round ? 'Offer the straws' : revealed ? 'New round' : 'Pull a straw'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
