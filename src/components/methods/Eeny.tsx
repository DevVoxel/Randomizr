import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { randomInt, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const MAX_ITEMS = 12
const TICK_MS = 110

interface Tick {
  idx: number
  eliminate: boolean
}

/**
 * Counting-out is the Josephus problem: count k around the survivors,
 * strike whoever the count lands on, repeat until one remains.
 */
function buildTicks(n: number, k: number): { ticks: Tick[]; survivor: number } {
  const alive = Array.from({ length: n }, (_, i) => i)
  const ticks: Tick[] = []
  let pos = 0
  while (alive.length > 1) {
    for (let step = 0; step < k; step++) {
      pos = (pos + 1) % alive.length
      ticks.push({ idx: alive[pos], eliminate: step === k - 1 })
    }
    alive.splice(pos, 1)
    pos = pos - 1 // next count starts from the item after the struck one
  }
  return { ticks, survivor: alive[0] }
}

export default function Eeny({ items, onResult }: { items: Item[]; onResult: (item: Item) => void }) {
  const [order, setOrder] = useState<Item[] | null>(null)
  const [cursor, setCursor] = useState(-1)
  const [dead, setDead] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)
  const [counting, setCounting] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timerRef.current), [])

  const run = () => {
    window.clearInterval(timerRef.current)
    const sampled = items.length > MAX_ITEMS ? shuffle(items).slice(0, MAX_ITEMS) : shuffle(items)
    const k = randomInt(3, 7)
    const { ticks, survivor } = buildTicks(sampled.length, k)
    setOrder(sampled)
    setDead(new Set())
    setDone(false)
    setCounting(true)
    let t = 0
    timerRef.current = window.setInterval(() => {
      if (t >= ticks.length) {
        window.clearInterval(timerRef.current)
        setCursor(survivor)
        setCounting(false)
        setDone(true)
        onResult(sampled[survivor])
        return
      }
      const tick = ticks[t++]
      setCursor(tick.idx)
      if (tick.eliminate) setDead((d) => new Set(d).add(tick.idx))
    }, TICK_MS)
  }

  const n = order?.length ?? 0
  const winner = order && done ? order[cursor] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {items.length > MAX_ITEMS && (
        <p className="text-xs text-muted-foreground">
          The circle fits {MAX_ITEMS} — each round counts {MAX_ITEMS} of your {items.length} items.
        </p>
      )}

      {order && (
        <div className="relative size-72 sm:size-80">
          {order.map((item, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2
            const isDead = dead.has(i)
            const isCursor = cursor === i && (counting || done)
            return (
              <div
                key={item.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 max-w-24 truncate px-1.5 py-0.5 text-xs border-2 text-center transition-colors duration-75 ${
                  isCursor && !isDead
                    ? 'bg-foreground text-background border-foreground font-semibold'
                    : isDead
                      ? 'border-dashed border-muted-foreground/40 text-muted-foreground/50 line-through'
                      : 'border-foreground'
                }`}
                style={{
                  left: `${50 + 44 * Math.cos(angle)}%`,
                  top: `${50 + 44 * Math.sin(angle)}%`,
                }}
              >
                {item.label}
              </div>
            )
          })}
          <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {counting ? 'counting…' : done ? 'survivor' : ''}
          </div>
        </div>
      )}

      <button onClick={run} disabled={counting} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {counting ? 'Counting…' : order ? 'Count again' : 'Start counting'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
