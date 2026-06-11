import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import type { Item } from '../../lib/types'
import { randomInt, shuffle } from '../../lib/random'
import { ResultBanner } from '../ResultBanner'

const LABELED_MAX = 14 // beyond this, seats show numbers and a legend carries the names

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
    const sampled = shuffle(items)
    const k = randomInt(3, 7)
    const { ticks, survivor } = buildTicks(sampled.length, k)
    // big circles count faster, so the whole rite stays around ten seconds
    const tickMs = Math.max(28, Math.min(110, Math.round(10_000 / ticks.length)))
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
    }, tickMs)
  }

  const n = order?.length ?? 0
  const labeled = n <= LABELED_MAX
  const winner = order && done ? order[cursor] : null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {order && (
        <div className="relative size-72 sm:size-80">
          {order.map((item, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2
            const isDead = dead.has(i)
            const isCursor = cursor === i && (counting || done)
            return (
              <div
                key={item.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 truncate border-2 text-center transition-colors duration-75 ${
                  labeled ? 'max-w-24 px-1.5 py-0.5 text-xs' : 'px-1 text-[9px] leading-4'
                } ${
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
                {labeled ? item.label : i + 1}
              </div>
            )
          })}
          <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {counting ? 'counting…' : done ? 'survivor' : ''}
          </div>
        </div>
      )}

      {order && !labeled && (
        <ol className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs w-full max-w-lg max-h-36 overflow-y-auto">
          {order.map((item, i) => (
            <li
              key={item.id}
              className={`truncate ${
                done && i === cursor
                  ? 'bg-foreground text-background px-1 font-semibold'
                  : dead.has(i)
                    ? 'text-muted-foreground/50 line-through'
                    : 'text-muted-foreground'
              }`}
            >
              {i + 1}· {item.label}
            </li>
          ))}
        </ol>
      )}

      <button onClick={run} disabled={counting} className="btn-ink inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg">
        <Play className="size-5" />
        {counting ? 'Counting…' : order ? 'Count again' : 'Start counting'}
      </button>

      {winner && <ResultBanner label={winner.label} image={winner.image} meta={winner.meta} />}
    </div>
  )
}
